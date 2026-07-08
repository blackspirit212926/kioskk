export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          city: string
          created_at: string
          details: string | null
          id: string
          is_default: boolean
          label: string
          neighborhood: string | null
          phone: string
          recipient_name: string
          street: string
          user_id: string
        }
        Insert: {
          city: string
          created_at?: string
          details?: string | null
          id?: string
          is_default?: boolean
          label: string
          neighborhood?: string | null
          phone: string
          recipient_name: string
          street: string
          user_id: string
        }
        Update: {
          city?: string
          created_at?: string
          details?: string | null
          id?: string
          is_default?: boolean
          label?: string
          neighborhood?: string | null
          phone?: string
          recipient_name?: string
          street?: string
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      exchange_rates: {
        Row: {
          currency: string
          rate_from_xof: number
          symbol: string
          updated_at: string
        }
        Insert: {
          currency: string
          rate_from_xof: number
          symbol: string
          updated_at?: string
        }
        Update: {
          currency?: string
          rate_from_xof?: number
          symbol?: string
          updated_at?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          image_url: string | null
          order_id: string
          product_id: string | null
          product_name: string
          quantity: number
          unit_price_xof: number
          variant_id: string | null
          variant_label: string | null
        }
        Insert: {
          id?: string
          image_url?: string | null
          order_id: string
          product_id?: string | null
          product_name: string
          quantity: number
          unit_price_xof: number
          variant_id?: string | null
          variant_label?: string | null
        }
        Update: {
          id?: string
          image_url?: string | null
          order_id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          unit_price_xof?: number
          variant_id?: string | null
          variant_label?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          note: string | null
          order_id: string
          status: Database["public"]["Enums"]["order_status"]
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          note?: string | null
          order_id: string
          status: Database["public"]["Enums"]["order_status"]
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          note?: string | null
          order_id?: string
          status?: Database["public"]["Enums"]["order_status"]
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address_id: string | null
          address_snapshot: Json | null
          admin_note: string | null
          created_at: string
          customer_note: string | null
          delivery_fee_xof: number | null
          id: string
          order_number: string
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          payment_proof_url: string | null
          payment_type: Database["public"]["Enums"]["payment_type"]
          status: Database["public"]["Enums"]["order_status"]
          subtotal_xof: number
          total_paid_xof: number
          transit_fee_xof: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address_id?: string | null
          address_snapshot?: Json | null
          admin_note?: string | null
          created_at?: string
          customer_note?: string | null
          delivery_fee_xof?: number | null
          id?: string
          order_number: string
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          payment_proof_url?: string | null
          payment_type?: Database["public"]["Enums"]["payment_type"]
          status?: Database["public"]["Enums"]["order_status"]
          subtotal_xof: number
          total_paid_xof?: number
          transit_fee_xof?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address_id?: string | null
          address_snapshot?: Json | null
          admin_note?: string | null
          created_at?: string
          customer_note?: string | null
          delivery_fee_xof?: number | null
          id?: string
          order_number?: string
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          payment_proof_url?: string | null
          payment_type?: Database["public"]["Enums"]["payment_type"]
          status?: Database["public"]["Enums"]["order_status"]
          subtotal_xof?: number
          total_paid_xof?: number
          transit_fee_xof?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_address_id_fkey"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt: string | null
          id: string
          product_id: string
          sort_order: number
          url: string
        }
        Insert: {
          alt?: string | null
          id?: string
          product_id: string
          sort_order?: number
          url: string
        }
        Update: {
          alt?: string | null
          id?: string
          product_id?: string
          sort_order?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_requests: {
        Row: {
          admin_note: string | null
          ai_refined_description: string | null
          budget_xof: number | null
          created_at: string
          description: string
          id: string
          photo_url: string | null
          quote_note: string | null
          quoted_delay_days: number | null
          quoted_price_xof: number | null
          reference_url: string | null
          status: Database["public"]["Enums"]["request_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_note?: string | null
          ai_refined_description?: string | null
          budget_xof?: number | null
          created_at?: string
          description: string
          id?: string
          photo_url?: string | null
          quote_note?: string | null
          quoted_delay_days?: number | null
          quoted_price_xof?: number | null
          reference_url?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_note?: string | null
          ai_refined_description?: string | null
          budget_xof?: number | null
          created_at?: string
          description?: string
          id?: string
          photo_url?: string | null
          quote_note?: string | null
          quoted_delay_days?: number | null
          quoted_price_xof?: number | null
          reference_url?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      product_variants: {
        Row: {
          id: string
          is_available: boolean
          name: string
          option_type: string
          option_value: string
          price_adjustment_xof: number
          product_id: string
          sort_order: number
        }
        Insert: {
          id?: string
          is_available?: boolean
          name: string
          option_type: string
          option_value: string
          price_adjustment_xof?: number
          product_id: string
          sort_order?: number
        }
        Update: {
          id?: string
          is_available?: boolean
          name?: string
          option_type?: string
          option_value?: string
          price_adjustment_xof?: number
          product_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          compare_at_price_xof: number | null
          created_at: string
          description: string | null
          estimated_delivery_days_max: number
          estimated_delivery_days_min: number
          id: string
          is_featured: boolean
          name: string
          origin_country: Database["public"]["Enums"]["origin_country"]
          payment_split_allowed: boolean
          price_xof: number
          rating_avg: number
          rating_count: number
          shipping_mode: Database["public"]["Enums"]["shipping_mode"]
          short_description: string | null
          slug: string
          status: Database["public"]["Enums"]["product_status"]
          updated_at: string
          view_count: number
        }
        Insert: {
          category_id?: string | null
          compare_at_price_xof?: number | null
          created_at?: string
          description?: string | null
          estimated_delivery_days_max?: number
          estimated_delivery_days_min?: number
          id?: string
          is_featured?: boolean
          name: string
          origin_country?: Database["public"]["Enums"]["origin_country"]
          payment_split_allowed?: boolean
          price_xof: number
          rating_avg?: number
          rating_count?: number
          shipping_mode?: Database["public"]["Enums"]["shipping_mode"]
          short_description?: string | null
          slug: string
          status?: Database["public"]["Enums"]["product_status"]
          updated_at?: string
          view_count?: number
        }
        Update: {
          category_id?: string | null
          compare_at_price_xof?: number | null
          created_at?: string
          description?: string | null
          estimated_delivery_days_max?: number
          estimated_delivery_days_min?: number
          id?: string
          is_featured?: boolean
          name?: string
          origin_country?: Database["public"]["Enums"]["origin_country"]
          payment_split_allowed?: boolean
          price_xof?: number
          rating_avg?: number
          rating_count?: number
          shipping_mode?: Database["public"]["Enums"]["shipping_mode"]
          short_description?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["product_status"]
          updated_at?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          admin_notes: string | null
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          preferred_currency: string
          preferred_language: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          preferred_currency?: string
          preferred_language?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          preferred_currency?: string
          preferred_language?: string
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          author_name: string | null
          comment: string | null
          created_at: string
          id: string
          order_id: string | null
          product_id: string
          rating: number
          user_id: string
        }
        Insert: {
          author_name?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          order_id?: string | null
          product_id: string
          rating: number
          user_id: string
        }
        Update: {
          author_name?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          order_id?: string | null
          product_id?: string
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "staff" | "customer"
      order_status:
        | "pending_payment"
        | "payment_confirmed"
        | "sourcing"
        | "purchased"
        | "in_transit"
        | "arrived"
        | "out_for_delivery"
        | "delivered"
        | "cancelled"
        | "refunded"
      origin_country: "CN" | "AE"
      payment_method:
        | "wave"
        | "orange_money"
        | "free_money"
        | "cash_on_delivery"
      payment_type: "full" | "split_50_50"
      product_status: "draft" | "published" | "archived"
      request_status:
        | "submitted"
        | "under_review"
        | "quoted"
        | "accepted"
        | "declined"
        | "converted"
      shipping_mode: "sea" | "air"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "staff", "customer"],
      order_status: [
        "pending_payment",
        "payment_confirmed",
        "sourcing",
        "purchased",
        "in_transit",
        "arrived",
        "out_for_delivery",
        "delivered",
        "cancelled",
        "refunded",
      ],
      origin_country: ["CN", "AE"],
      payment_method: [
        "wave",
        "orange_money",
        "free_money",
        "cash_on_delivery",
      ],
      payment_type: ["full", "split_50_50"],
      product_status: ["draft", "published", "archived"],
      request_status: [
        "submitted",
        "under_review",
        "quoted",
        "accepted",
        "declined",
        "converted",
      ],
      shipping_mode: ["sea", "air"],
    },
  },
} as const
