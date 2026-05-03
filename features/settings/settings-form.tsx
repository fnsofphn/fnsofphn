"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { LogOut, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { PremiumCard } from "@/components/shared/premium-card";
import { signOutAction } from "@/features/auth/actions";
import { updateSettings } from "@/features/settings/actions";
import { settingsSchema, type SettingsValues } from "@/lib/validations/settings";

type SettingsFormProps = {
  defaultValues: SettingsValues;
  email: string | null;
};

export function SettingsForm({ defaultValues, email }: SettingsFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues
  });

  function onSubmit(values: SettingsValues) {
    startTransition(async () => {
      const result = await updateSettings(values);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      router.refresh();
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
      <PremiumCard hover={false}>
        <h2 className="text-2xl font-bold text-text-primary">Hồ sơ cá nhân</h2>
        <p className="mt-2 text-sm leading-6 text-text-secondary">Các nhãn phản chiếu chỉ dùng cho tự quan sát bản thân và có thể chỉnh bất cứ lúc nào.</p>

        <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="fullName">Tên hiển thị</Label>
            <Input id="fullName" {...form.register("fullName")} />
            {form.formState.errors.fullName ? <p className="text-sm text-rose-600">{form.formState.errors.fullName.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthDate">Ngày sinh</Label>
            <Input id="birthDate" type="date" {...form.register("birthDate")} />
            {form.formState.errors.birthDate ? <p className="text-sm text-rose-600">{form.formState.errors.birthDate.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferredTheme">Chủ đề giao diện</Label>
            <Select id="preferredTheme" {...form.register("preferredTheme")}>
              <option value="aether">Aether indigo</option>
              <option value="silver">Cool silver</option>
              <option value="calm">Calm cyan</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="westernZodiacLabel">Cung hoàng đạo</Label>
            <Input id="westernZodiacLabel" {...form.register("westernZodiacLabel")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lunarYearLabel">Năm âm lịch</Label>
            <Input id="lunarYearLabel" {...form.register("lunarYearLabel")} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="elementLabel">Yếu tố / nạp âm</Label>
            <Input id="elementLabel" {...form.register("elementLabel")} />
          </div>

          <Button type="submit" disabled={isPending} className="md:col-span-2">
            <Save className="size-4" />
            {isPending ? "Đang lưu..." : "Lưu cài đặt"}
          </Button>
        </form>
      </PremiumCard>

      <PremiumCard hover={false}>
        <h2 className="text-2xl font-bold text-text-primary">Tài khoản</h2>
        <div className="mt-5 rounded-[24px] border border-border-soft bg-white/58 p-4">
          <p className="text-sm font-semibold text-text-secondary">Email đăng nhập</p>
          <p className="mt-2 break-all text-base font-bold text-text-primary">{email ?? "Chưa có email"}</p>
        </div>
        <div className="mt-5 rounded-[24px] border border-border-soft bg-white/58 p-4">
          <p className="text-sm font-semibold text-text-secondary">Bảo mật dữ liệu</p>
          <p className="mt-2 text-sm leading-6 text-text-secondary">Dữ liệu chính lưu trong Supabase và được bảo vệ bằng Row Level Security theo từng người dùng.</p>
        </div>
        <form action={signOutAction} className="mt-6">
          <Button type="submit" variant="secondary" className="w-full">
            <LogOut className="size-4" />
            Đăng xuất
          </Button>
        </form>
      </PremiumCard>
    </div>
  );
}
