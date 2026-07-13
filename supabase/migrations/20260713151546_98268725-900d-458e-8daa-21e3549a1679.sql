
-- =========================================================
-- 1. order_payments
-- =========================================================
CREATE TYPE public.payment_kind AS ENUM ('deposit', 'balance', 'full');
CREATE TYPE public.payment_status AS ENUM ('pending', 'confirmed', 'rejected');

CREATE TABLE public.order_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  kind public.payment_kind NOT NULL,
  amount_xof bigint NOT NULL CHECK (amount_xof >= 0),
  method public.payment_method,
  proof_url text,
  status public.payment_status NOT NULL DEFAULT 'pending',
  admin_note text,
  confirmed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX order_payments_order_id_idx ON public.order_payments(order_id);

GRANT SELECT, INSERT, UPDATE ON public.order_payments TO authenticated;
GRANT ALL ON public.order_payments TO service_role;
ALTER TABLE public.order_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read own payments" ON public.order_payments FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id
    AND (o.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'))));

CREATE POLICY "insert own payments" ON public.order_payments FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()));

CREATE POLICY "admin update payments" ON public.order_payments FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));

CREATE TRIGGER t_order_payments_updated BEFORE UPDATE ON public.order_payments
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- =========================================================
-- 2. promo_codes + promo_redemptions
-- =========================================================
CREATE TYPE public.discount_type AS ENUM ('percent', 'fixed');

CREATE TABLE public.promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  discount_type public.discount_type NOT NULL,
  discount_value numeric NOT NULL CHECK (discount_value > 0),
  min_subtotal_xof bigint NOT NULL DEFAULT 0,
  max_uses integer,
  used_count integer NOT NULL DEFAULT 0,
  expires_at timestamptz,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.promo_codes TO anon, authenticated;
GRANT ALL ON public.promo_codes TO service_role;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read active promo codes" ON public.promo_codes FOR SELECT TO anon, authenticated
  USING (active = true);
CREATE POLICY "admin manage promo codes" ON public.promo_codes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER t_promo_codes_updated BEFORE UPDATE ON public.promo_codes
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.promo_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  promo_code_id uuid NOT NULL REFERENCES public.promo_codes(id) ON DELETE RESTRICT,
  code text NOT NULL,
  amount_saved_xof bigint NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX promo_redemptions_order_idx ON public.promo_redemptions(order_id);

GRANT SELECT, INSERT ON public.promo_redemptions TO authenticated;
GRANT ALL ON public.promo_redemptions TO service_role;
ALTER TABLE public.promo_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read own redemptions" ON public.promo_redemptions FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id
    AND (o.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'))));
CREATE POLICY "insert own redemptions" ON public.promo_redemptions FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()));

-- =========================================================
-- 3. products: group buy
-- =========================================================
ALTER TABLE public.products
  ADD COLUMN group_buy_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN group_buy_threshold integer,
  ADD COLUMN group_buy_deadline timestamptz,
  ADD COLUMN group_buy_current integer NOT NULL DEFAULT 0;

-- =========================================================
-- 4. orders: promo + group buy flag
-- =========================================================
ALTER TABLE public.orders
  ADD COLUMN promo_code text,
  ADD COLUMN discount_xof bigint NOT NULL DEFAULT 0,
  ADD COLUMN is_group_buy boolean NOT NULL DEFAULT false;

-- =========================================================
-- 5. apply_promo_code RPC
-- =========================================================
CREATE OR REPLACE FUNCTION public.apply_promo_code(_code text, _subtotal_xof bigint)
RETURNS TABLE(valid boolean, discount_xof bigint, reason text)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  pc public.promo_codes;
  disc bigint;
BEGIN
  SELECT * INTO pc FROM public.promo_codes WHERE code = upper(_code) AND active = true;
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0::bigint, 'Code introuvable'; RETURN;
  END IF;
  IF pc.expires_at IS NOT NULL AND pc.expires_at < now() THEN
    RETURN QUERY SELECT false, 0::bigint, 'Code expiré'; RETURN;
  END IF;
  IF pc.max_uses IS NOT NULL AND pc.used_count >= pc.max_uses THEN
    RETURN QUERY SELECT false, 0::bigint, 'Code épuisé'; RETURN;
  END IF;
  IF _subtotal_xof < pc.min_subtotal_xof THEN
    RETURN QUERY SELECT false, 0::bigint, format('Sous-total minimum %s FCFA requis', pc.min_subtotal_xof); RETURN;
  END IF;
  IF pc.discount_type = 'percent' THEN
    disc := floor(_subtotal_xof * pc.discount_value / 100)::bigint;
  ELSE
    disc := least(pc.discount_value::bigint, _subtotal_xof);
  END IF;
  RETURN QUERY SELECT true, disc, 'ok';
END;
$$;

GRANT EXECUTE ON FUNCTION public.apply_promo_code(text, bigint) TO anon, authenticated;

-- =========================================================
-- 6. Trigger: order status → history + group buy counter
-- =========================================================
CREATE OR REPLACE FUNCTION public.log_order_status_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' OR NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.order_status_history (order_id, status, created_by)
    VALUES (NEW.id, NEW.status, auth.uid());
    -- Increment group buy counter on payment confirmation
    IF NEW.is_group_buy AND NEW.status = 'payment_confirmed'
       AND (TG_OP = 'INSERT' OR OLD.status <> 'payment_confirmed') THEN
      UPDATE public.products p
      SET group_buy_current = group_buy_current + oi.quantity
      FROM public.order_items oi
      WHERE oi.order_id = NEW.id AND oi.product_id = p.id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER t_orders_status_log
  AFTER INSERT OR UPDATE OF status ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.log_order_status_change();

-- =========================================================
-- 7. Backfill existing payment proofs → order_payments
-- =========================================================
INSERT INTO public.order_payments (order_id, kind, amount_xof, method, proof_url, status, created_at)
SELECT
  o.id,
  CASE WHEN o.payment_type = 'split_50_50' THEN 'deposit'::public.payment_kind
       ELSE 'full'::public.payment_kind END,
  CASE WHEN o.payment_type = 'split_50_50' THEN o.total_paid_xof / 2
       ELSE o.total_paid_xof END,
  o.payment_method,
  o.payment_proof_url,
  CASE WHEN o.status IN ('pending_payment') THEN 'pending'::public.payment_status
       ELSE 'confirmed'::public.payment_status END,
  o.created_at
FROM public.orders o
WHERE o.payment_proof_url IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.order_payments p WHERE p.order_id = o.id);
