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
      bond_invites: {
        Row: {
          accepted_at: string | null
          bond_id: string
          created_at: string
          expires_at: string
          id: string
          invitee_email: string
          inviter_id: string
          status: Database["public"]["Enums"]["bond_invite_status"]
          token: string
        }
        Insert: {
          accepted_at?: string | null
          bond_id: string
          created_at?: string
          expires_at?: string
          id?: string
          invitee_email: string
          inviter_id: string
          status?: Database["public"]["Enums"]["bond_invite_status"]
          token?: string
        }
        Update: {
          accepted_at?: string | null
          bond_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          invitee_email?: string
          inviter_id?: string
          status?: Database["public"]["Enums"]["bond_invite_status"]
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "bond_invites_bond_id_fkey"
            columns: ["bond_id"]
            isOneToOne: false
            referencedRelation: "bonds"
            referencedColumns: ["id"]
          },
        ]
      }
      bond_shared_goals: {
        Row: {
          bond_id: string
          created_at: string
          goal_id: string
          id: string
          shared_by: string
        }
        Insert: {
          bond_id: string
          created_at?: string
          goal_id: string
          id?: string
          shared_by: string
        }
        Update: {
          bond_id?: string
          created_at?: string
          goal_id?: string
          id?: string
          shared_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "bond_shared_goals_bond_id_fkey"
            columns: ["bond_id"]
            isOneToOne: false
            referencedRelation: "bonds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bond_shared_goals_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      bonds: {
        Row: {
          created_at: string
          ended_at: string | null
          id: string
          inviter_id: string
          partner_email: string
          partner_id: string | null
          partner_label: string | null
          status: Database["public"]["Enums"]["bond_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          id?: string
          inviter_id: string
          partner_email: string
          partner_id?: string | null
          partner_label?: string | null
          status?: Database["public"]["Enums"]["bond_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          id?: string
          inviter_id?: string
          partner_email?: string
          partner_id?: string | null
          partner_label?: string | null
          status?: Database["public"]["Enums"]["bond_status"]
          updated_at?: string
        }
        Relationships: []
      }
      goals: {
        Row: {
          apr: number | null
          created_at: string
          current_amount: number
          days_to_goal: number | null
          id: string
          is_north_star: boolean
          label: string
          monthly: number
          position: number
          priority: Database["public"]["Enums"]["goal_priority"]
          tagline: string | null
          target: number
          updated_at: string
          user_id: string
        }
        Insert: {
          apr?: number | null
          created_at?: string
          current_amount?: number
          days_to_goal?: number | null
          id?: string
          is_north_star?: boolean
          label: string
          monthly?: number
          position?: number
          priority?: Database["public"]["Enums"]["goal_priority"]
          tagline?: string | null
          target?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          apr?: number | null
          created_at?: string
          current_amount?: number
          days_to_goal?: number | null
          id?: string
          is_north_star?: boolean
          label?: string
          monthly?: number
          position?: number
          priority?: Database["public"]["Enums"]["goal_priority"]
          tagline?: string | null
          target?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      job_applications: {
        Row: {
          created_at: string
          email: string
          github_url: string | null
          id: string
          linkedin_url: string | null
          location: string | null
          name: string
          note: string | null
          portfolio_url: string | null
          resume_url: string | null
          role_slug: string
          role_title: string
          source: string | null
          status: Database["public"]["Enums"]["application_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          github_url?: string | null
          id?: string
          linkedin_url?: string | null
          location?: string | null
          name: string
          note?: string | null
          portfolio_url?: string | null
          resume_url?: string | null
          role_slug: string
          role_title: string
          source?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          github_url?: string | null
          id?: string
          linkedin_url?: string | null
          location?: string | null
          name?: string
          note?: string | null
          portfolio_url?: string | null
          resume_url?: string | null
          role_slug?: string
          role_title?: string
          source?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          onboarded: boolean
          saturn_cap_pct: number
          trust_mode: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          onboarded?: boolean
          saturn_cap_pct?: number
          trust_mode?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          onboarded?: boolean
          saturn_cap_pct?: number
          trust_mode?: string
          updated_at?: string
        }
        Relationships: []
      }
      ripples: {
        Row: {
          action: string
          amount: number
          created_at: string
          days_delta: number
          goal_id: string | null
          id: string
          tag: string
          user_id: string
        }
        Insert: {
          action: string
          amount?: number
          created_at?: string
          days_delta?: number
          goal_id?: string | null
          id?: string
          tag?: string
          user_id: string
        }
        Update: {
          action?: string
          amount?: number
          created_at?: string
          days_delta?: number
          goal_id?: string | null
          id?: string
          tag?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ripples_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlist_items: {
        Row: {
          alternatives: Json
          brand: string | null
          created_at: string
          fundable_months: number | null
          id: string
          image_url: string | null
          impact_days: number | null
          impact_goal_id: string | null
          name: string
          notes: string | null
          position: number
          price: number
          status: Database["public"]["Enums"]["wishlist_status"]
          updated_at: string
          url: string | null
          user_id: string
          verdict: Database["public"]["Enums"]["wishlist_verdict"]
          verdict_text: string | null
        }
        Insert: {
          alternatives?: Json
          brand?: string | null
          created_at?: string
          fundable_months?: number | null
          id?: string
          image_url?: string | null
          impact_days?: number | null
          impact_goal_id?: string | null
          name: string
          notes?: string | null
          position?: number
          price?: number
          status?: Database["public"]["Enums"]["wishlist_status"]
          updated_at?: string
          url?: string | null
          user_id: string
          verdict?: Database["public"]["Enums"]["wishlist_verdict"]
          verdict_text?: string | null
        }
        Update: {
          alternatives?: Json
          brand?: string | null
          created_at?: string
          fundable_months?: number | null
          id?: string
          image_url?: string | null
          impact_days?: number | null
          impact_goal_id?: string | null
          name?: string
          notes?: string | null
          position?: number
          price?: number
          status?: Database["public"]["Enums"]["wishlist_status"]
          updated_at?: string
          url?: string | null
          user_id?: string
          verdict?: Database["public"]["Enums"]["wishlist_verdict"]
          verdict_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_items_impact_goal_id_fkey"
            columns: ["impact_goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_bond_invite: { Args: { p_token: string }; Returns: string }
      current_user_email: { Args: never; Returns: string }
    }
    Enums: {
      application_status: "new" | "reviewed" | "archived"
      bond_invite_status:
        | "pending"
        | "accepted"
        | "declined"
        | "cancelled"
        | "expired"
      bond_status: "pending" | "active" | "ended"
      goal_priority: "P0" | "P1" | "P2" | "Engine"
      wishlist_status:
        | "considering"
        | "planning"
        | "deferred"
        | "purchased"
        | "dismissed"
      wishlist_verdict: "go" | "caution" | "defer" | "pending"
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
      application_status: ["new", "reviewed", "archived"],
      bond_invite_status: [
        "pending",
        "accepted",
        "declined",
        "cancelled",
        "expired",
      ],
      bond_status: ["pending", "active", "ended"],
      goal_priority: ["P0", "P1", "P2", "Engine"],
      wishlist_status: [
        "considering",
        "planning",
        "deferred",
        "purchased",
        "dismissed",
      ],
      wishlist_verdict: ["go", "caution", "defer", "pending"],
    },
  },
} as const
