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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      alphabet_signs: {
        Row: {
          created_at: string
          id: string
          letter: string
          source_url: string | null
          updated_at: string
          video_url: string
        }
        Insert: {
          created_at?: string
          id?: string
          letter: string
          source_url?: string | null
          updated_at?: string
          video_url: string
        }
        Update: {
          created_at?: string
          id?: string
          letter?: string
          source_url?: string | null
          updated_at?: string
          video_url?: string
        }
        Relationships: []
      }
      donation_pages: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          image_url: string | null
          organization: string
          scraped_at: string | null
          source_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          organization: string
          scraped_at?: string | null
          source_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          organization?: string
          scraped_at?: string | null
          source_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      exercises: {
        Row: {
          content: Json
          created_at: string
          id: string
          lesson_id: string
          order_index: number
          type: string
        }
        Insert: {
          content: Json
          created_at?: string
          id?: string
          lesson_id: string
          order_index: number
          type: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          lesson_id?: string
          order_index?: number
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercises_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      glossary_signs: {
        Row: {
          category: string
          created_at: string
          definition: string | null
          external_id: string | null
          gloss: string | null
          id: string
          normalized: string
          source: string
          source_url: string | null
          term: string
          updated_at: string
          video_url: string
        }
        Insert: {
          category: string
          created_at?: string
          definition?: string | null
          external_id?: string | null
          gloss?: string | null
          id?: string
          normalized: string
          source?: string
          source_url?: string | null
          term: string
          updated_at?: string
          video_url: string
        }
        Update: {
          category?: string
          created_at?: string
          definition?: string | null
          external_id?: string | null
          gloss?: string | null
          id?: string
          normalized?: string
          source?: string
          source_url?: string | null
          term?: string
          updated_at?: string
          video_url?: string
        }
        Relationships: []
      }
      job_listings: {
        Row: {
          category: string | null
          company: string | null
          contact_info: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          location: string | null
          published_at: string | null
          requirements: string | null
          scraped_at: string | null
          source_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          company?: string | null
          contact_info?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          published_at?: string | null
          requirements?: string | null
          scraped_at?: string | null
          source_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          company?: string | null
          contact_info?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          published_at?: string | null
          requirements?: string | null
          scraped_at?: string | null
          source_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      lessons: {
        Row: {
          age_group: string | null
          category: string | null
          created_at: string
          description: string | null
          id: string
          is_quiz: boolean
          level: Database["public"]["Enums"]["cecrl_level"] | null
          order_index: number
          title: string
          updated_at: string
        }
        Insert: {
          age_group?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_quiz?: boolean
          level?: Database["public"]["Enums"]["cecrl_level"] | null
          order_index: number
          title: string
          updated_at?: string
        }
        Update: {
          age_group?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_quiz?: boolean
          level?: Database["public"]["Enums"]["cecrl_level"] | null
          order_index?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      news_articles: {
        Row: {
          category: string | null
          content: string | null
          created_at: string | null
          excerpt: string | null
          id: string
          image_url: string | null
          published_at: string | null
          scraped_at: string | null
          source_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          content?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: string
          image_url?: string | null
          published_at?: string | null
          scraped_at?: string | null
          source_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          content?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: string
          image_url?: string | null
          published_at?: string | null
          scraped_at?: string | null
          source_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      post_consultation_checklist: {
        Row: {
          checked: boolean
          item_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          checked?: boolean
          item_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          checked?: boolean
          item_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      post_consultation_notes: {
        Row: {
          content: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_type: string | null
          age: number | null
          avatar_url: string | null
          created_at: string
          healthcare_provider_id: string | null
          hearing_status: string | null
          id: string
          installation_reason: string | null
          learning_level: string | null
          onboarding_completed: boolean | null
          preferred_age_group: string | null
          profession: string | null
          status: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          account_type?: string | null
          age?: number | null
          avatar_url?: string | null
          created_at?: string
          healthcare_provider_id?: string | null
          hearing_status?: string | null
          id: string
          installation_reason?: string | null
          learning_level?: string | null
          onboarding_completed?: boolean | null
          preferred_age_group?: string | null
          profession?: string | null
          status?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          account_type?: string | null
          age?: number | null
          avatar_url?: string | null
          created_at?: string
          healthcare_provider_id?: string | null
          hearing_status?: string | null
          id?: string
          installation_reason?: string | null
          learning_level?: string | null
          onboarding_completed?: boolean | null
          preferred_age_group?: string | null
          profession?: string | null
          status?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_healthcare_provider_id_fkey"
            columns: ["healthcare_provider_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          attempts: number | null
          best_time: number | null
          completed: boolean | null
          completed_at: string | null
          created_at: string
          exercise_id: string | null
          id: string
          lesson_id: string
          level: Database["public"]["Enums"]["cecrl_level"] | null
          score: number | null
          total_questions: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          attempts?: number | null
          best_time?: number | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          exercise_id?: string | null
          id?: string
          lesson_id: string
          level?: Database["public"]["Enums"]["cecrl_level"] | null
          score?: number | null
          total_questions?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          attempts?: number | null
          best_time?: number | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          exercise_id?: string | null
          id?: string
          lesson_id?: string
          level?: Database["public"]["Enums"]["cecrl_level"] | null
          score?: number | null
          total_questions?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      word_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      word_sign_categories: {
        Row: {
          category_id: string
          created_at: string | null
          id: string
          word_sign_id: string
        }
        Insert: {
          category_id: string
          created_at?: string | null
          id?: string
          word_sign_id: string
        }
        Update: {
          category_id?: string
          created_at?: string | null
          id?: string
          word_sign_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "word_sign_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "word_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "word_sign_categories_word_sign_id_fkey"
            columns: ["word_sign_id"]
            isOneToOne: false
            referencedRelation: "word_signs"
            referencedColumns: ["id"]
          },
        ]
      }
      word_sign_variants: {
        Row: {
          created_at: string | null
          id: string
          source: string
          source_url: string | null
          tags: string[] | null
          updated_at: string | null
          video_url: string
          word_sign_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          source?: string
          source_url?: string | null
          tags?: string[] | null
          updated_at?: string | null
          video_url: string
          word_sign_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          source?: string
          source_url?: string | null
          tags?: string[] | null
          updated_at?: string | null
          video_url?: string
          word_sign_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "word_sign_variants_word_sign_id_fkey"
            columns: ["word_sign_id"]
            isOneToOne: false
            referencedRelation: "word_signs"
            referencedColumns: ["id"]
          },
        ]
      }
      word_signs: {
        Row: {
          category: string
          created_at: string
          id: string
          phrase: string | null
          signed_grammar: string | null
          source_url: string | null
          updated_at: string
          video_url: string
          word: string
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          phrase?: string | null
          signed_grammar?: string | null
          source_url?: string | null
          updated_at?: string
          video_url: string
          word: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          phrase?: string | null
          signed_grammar?: string | null
          source_url?: string | null
          updated_at?: string
          video_url?: string
          word?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_healthcare_provider_of: { Args: { patient: string }; Returns: boolean }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "user" | "pro" | "patient"
      cecrl_level: "A1" | "A2" | "B1" | "B2"
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
      app_role: ["admin", "user", "pro", "patient"],
      cecrl_level: ["A1", "A2", "B1", "B2"],
    },
  },
} as const
