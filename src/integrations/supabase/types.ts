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
      job_listings: {
        Row: {
          category: string | null
          company: string | null
          contact_info: string | null
          created_at: string | null
          description: string | null
          id: string
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
      profiles: {
        Row: {
          age: number | null
          avatar_url: string | null
          created_at: string
          hearing_status: string | null
          id: string
          installation_reason: string | null
          onboarding_completed: boolean | null
          preferred_age_group: string | null
          profession: string | null
          status: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          created_at?: string
          hearing_status?: string | null
          id: string
          installation_reason?: string | null
          onboarding_completed?: boolean | null
          preferred_age_group?: string | null
          profession?: string | null
          status?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          age?: number | null
          avatar_url?: string | null
          created_at?: string
          hearing_status?: string | null
          id?: string
          installation_reason?: string | null
          onboarding_completed?: boolean | null
          preferred_age_group?: string | null
          profession?: string | null
          status?: string | null
          updated_at?: string
          username?: string | null
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
      word_signs: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          source_url: string | null
          updated_at: string
          video_url: string
          word: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          source_url?: string | null
          updated_at?: string
          video_url: string
          word: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
      cecrl_level: ["A1", "A2", "B1", "B2"],
    },
  },
} as const
