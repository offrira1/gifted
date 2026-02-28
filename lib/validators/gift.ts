import { z } from "zod";

const MAX_MEDIA_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/webm"];
const MIN_AMOUNT = 10;

export const giftStep1Schema = z.object({
  giver_display_name: z.string().min(1, "שם נותן/נותני המתנה חובה"),
  blessing_text: z.string().optional(),
  media: z
    .any()
    .optional()
    .refine(
      (files) => !files?.length || (files[0] && files[0].size <= MAX_MEDIA_SIZE),
      "גודל הקובץ מקסימום 10MB"
    )
    .refine(
      (files) =>
        !files?.length ||
        (files[0] && [...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_VIDEO_TYPES].includes(files[0].type)),
      "סוג קובץ: תמונה או וידאו (JPEG, PNG, WebP, GIF, MP4, WebM)"
    ),
  payer_first_name: z.string().min(1, "שם פרטי חובה"),
  payer_last_name: z.string().min(1, "שם משפחה חובה"),
  amount: z
    .number({ invalid_type_error: "סכום חייב להיות מספר" })
    .min(MIN_AMOUNT, `סכום מינימלי ₪${MIN_AMOUNT}`),
});

export const paymentMethodSchema = z.enum(
  ["bit", "paybox", "paypal", "google_pay", "apple_pay", "credit_card", "bank_transfer"],
  { required_error: "נא לבחור אמצעי תשלום" }
);

export type GiftStep1Input = z.infer<typeof giftStep1Schema>;
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;
