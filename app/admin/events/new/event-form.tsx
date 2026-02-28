"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createEventSchema, eventTypeOptions, type CreateEventInput } from "@/lib/validators/event";
import { createEvent } from "@/server/actions/events";
import { uploadEventCover } from "@/server/actions/upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function EventForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateEventInput>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      type: undefined,
      event_date: "",
      event_time: "18:00",
      suggested_amounts: "100, 200, 500, 1000",
      theme_color: "#c41e5a",
    },
  });

  const type = watch("type");

  async function onSubmit(data: CreateEventInput) {
    setServerError(null);
    const result = await createEvent({
      ...data,
      cover_media_url: undefined,
    });
    if (result?.error) {
      setServerError(result.error);
      return;
    }
    const eventId = result?.data?.id;
    if (!eventId) return;
    if (data.cover_media?.length && data.cover_media[0]) {
      const up = await uploadEventCover(eventId, data.cover_media[0]);
      if (up.url) {
        const { updateEventCover } = await import("@/server/actions/events");
        await updateEventCover(eventId, up.url);
      }
      if (up.error) setServerError(up.error);
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {serverError && (
        <div className="rounded-md bg-destructive/10 text-destructive text-sm p-3" role="alert">
          {serverError}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>פרטי האירוע</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>סוג אירוע</Label>
            <Select onValueChange={(v) => setValue("type", v as CreateEventInput["type"])} value={type}>
              <SelectTrigger>
                <SelectValue placeholder="בחר סוג" />
              </SelectTrigger>
              <SelectContent>
                {eventTypeOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-destructive" role="alert">{errors.type.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="event_date">תאריך</Label>
              <Input id="event_date" type="date" {...register("event_date")} aria-invalid={!!errors.event_date} />
              {errors.event_date && (
                <p className="text-sm text-destructive" role="alert">{errors.event_date.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="event_time">שעה</Label>
              <Input id="event_time" type="time" {...register("event_time")} aria-invalid={!!errors.event_time} />
              {errors.event_time && (
                <p className="text-sm text-destructive" role="alert">{errors.event_time.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">מיקום (אופציונלי)</Label>
            <Input id="location" {...register("location")} placeholder="אולם, כתובת" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="welcome_text">טקסט ברוכים הבאים (אופציונלי)</Label>
            <Textarea id="welcome_text" {...register("welcome_text")} rows={3} placeholder="הודעת ברוכים הבאים" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cover_media">תמונת קאבר / וידאו קצר (אופציונלי, עד 10MB)</Label>
            <Input id="cover_media" type="file" accept="image/*,video/mp4,video/webm" {...register("cover_media")} />
            {errors.cover_media && (
              <p className="text-sm text-destructive" role="alert">
                {String(errors.cover_media?.message ?? "")}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>פרטי בעל האירוע</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="owner_display_name">שם לתצוגה</Label>
            <Input id="owner_display_name" {...register("owner_display_name")} placeholder="שם מלא" aria-invalid={!!errors.owner_display_name} />
            {errors.owner_display_name && (
              <p className="text-sm text-destructive" role="alert">{errors.owner_display_name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="owner_email">אימייל</Label>
            <Input id="owner_email" type="email" {...register("owner_email")} aria-invalid={!!errors.owner_email} />
            {errors.owner_email && (
              <p className="text-sm text-destructive" role="alert">{errors.owner_email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="owner_phone">טלפון</Label>
            <Input id="owner_phone" type="tel" {...register("owner_phone")} aria-invalid={!!errors.owner_phone} />
            {errors.owner_phone && (
              <p className="text-sm text-destructive" role="alert">{errors.owner_phone.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="owner_address">כתובת (אופציונלי)</Label>
            <Input id="owner_address" {...register("owner_address")} placeholder="כתובת מלאה" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="private_area_password">סיסמה לאזור אישי (אופציונלי)</Label>
            <Input id="private_area_password" type="password" {...register("private_area_password")} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t">
            <div className="space-y-2">
              <Label htmlFor="bit_phone">טלפון ל-BIT (מקבל מתנות)</Label>
              <Input id="bit_phone" type="tel" {...register("bit_phone")} placeholder="05xxxxxxxx" />
              <p className="text-xs text-muted-foreground">מספר שאליו ישלחו אורחים ב-BIT</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="paybox_phone">טלפון ל-PayBox (מקבל מתנות)</Label>
              <Input id="paybox_phone" type="tel" {...register("paybox_phone")} placeholder="05xxxxxxxx" />
              <p className="text-xs text-muted-foreground">מספר שאליו ישלחו אורחים ב-PayBox</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>הגדרות דף מתנה</CardTitle>
          <p className="text-sm text-muted-foreground">סכומים מוצעים וצבע ערכת נושא לדף האורח</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="suggested_amounts">סכומים מוצעים (מופרדים בפסיק)</Label>
            <Input id="suggested_amounts" {...register("suggested_amounts")} placeholder="100, 200, 500, 1000" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="theme_color">צבע ערכת נושא (hex)</Label>
            <Input id="theme_color" {...register("theme_color")} className="font-mono max-w-[10rem]" placeholder="#c41e5a" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>חשבון בנק לקבלת מתנות</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bank_name">שם הבנק</Label>
            <Input id="bank_name" {...register("bank_name")} aria-invalid={!!errors.bank_name} />
            {errors.bank_name && (
              <p className="text-sm text-destructive" role="alert">{errors.bank_name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="bank_branch">סניף</Label>
            <Input id="bank_branch" {...register("bank_branch")} aria-invalid={!!errors.bank_branch} />
            {errors.bank_branch && (
              <p className="text-sm text-destructive" role="alert">{errors.bank_branch.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="bank_account_number">מספר חשבון</Label>
            <Input id="bank_account_number" {...register("bank_account_number")} aria-invalid={!!errors.bank_account_number} />
            {errors.bank_account_number && (
              <p className="text-sm text-destructive" role="alert">{errors.bank_account_number.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="bank_beneficiary_name">שם מוטב</Label>
            <Input id="bank_beneficiary_name" {...register("bank_beneficiary_name")} aria-invalid={!!errors.bank_beneficiary_name} />
            {errors.bank_beneficiary_name && (
              <p className="text-sm text-destructive" role="alert">{errors.bank_beneficiary_name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="bank_iban">IBAN (אופציונלי)</Label>
            <Input id="bank_iban" {...register("bank_iban")} placeholder="IL..." />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "שומר..." : "צור אירוע"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          ביטול
        </Button>
      </div>
    </form>
  );
}
