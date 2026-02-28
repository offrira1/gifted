import { z } from "zod";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/webm"];

export const eventTypeOptions = [
  { value: "wedding", label: "חתונה" },
  { value: "bar_mitzvah", label: "בר מצווה" },
  { value: "bat_mitzvah", label: "בת מצווה" },
  { value: "private", label: "אירוע פרטי" },
  { value: "other", label: "אחר" },
] as const;

export const createEventSchema = z.object({
  type: z.enum(["wedding", "bar_mitzvah", "bat_mitzvah", "private", "other"], {
    required_error: "נא לבחור סוג אירוע",
  }),
  owner_display_name: z.string().min(1, "שם בעל האירוע חובה"),
  owner_email: z.string().email("כתובת אימייל לא תקינה"),
  owner_phone: z.string().min(9, "טלפון חובה (לפחות 9 ספרות)"),
  owner_address: z.string().optional(),
  private_area_password: z.string().optional(),
  bank_name: z.string().min(1, "שם הבנק חובה"),
  bank_branch: z.string().min(1, "סניף חובה"),
  bank_account_number: z.string().min(1, "מספר חשבון חובה"),
  bank_beneficiary_name: z.string().min(1, "שם מוטב חובה"),
  bank_iban: z.string().optional(),
  event_date: z.string().min(1, "תאריך האירוע חובה"),
  event_time: z.string().min(1, "שעת האירוע חובה"),
  location: z.string().optional(),
  welcome_text: z.string().optional(),
  bit_phone: z.string().optional(),
  paybox_phone: z.string().optional(),
  suggested_amounts: z.string().optional(),
  theme_color: z.string().optional(),
  cover_media: z
    .any()
    .optional()
    .refine(
      (files) => !files?.length || (files[0] && files[0].size <= MAX_FILE_SIZE),
      "גודל הקובץ מקסימום 10MB"
    )
    .refine(
      (files) =>
        !files?.length ||
        (files[0] && [...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_VIDEO_TYPES].includes(files[0].type)),
      "סוג קובץ: תמונה (JPEG, PNG, WebP, GIF) או וידאו (MP4, WebM)"
    ),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
