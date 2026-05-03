"use client";

import { useMemo, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit3, Filter, Plus, Save, Trash2, X } from "lucide-react";
import { type FieldValues, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/shared/empty-state";
import { PremiumCard } from "@/components/shared/premium-card";
import { deleteRecord, upsertRecord } from "@/features/shared/actions";
import type { EditableTable, RecordField, TableSchema } from "@/features/shared/record-schema";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils/format";

export type RecordManagerConfig = {
  table: EditableTable;
  path: string;
  title: string;
  description: string;
  createLabel: string;
  emptyTitle: string;
  emptyDescription: string;
  schema: TableSchema;
  rows: Array<Record<string, unknown>>;
  filterFields?: string[];
};

function buildClientSchema(fields: RecordField[]) {
  const shape: Record<string, z.ZodType> = {};

  for (const field of fields) {
    shape[field.name] = field.required
      ? z.unknown().refine((value) => {
          if (field.type === "checkbox") return true;
          return value !== undefined && value !== null && String(value).trim().length > 0;
        }, `${field.label} là bắt buộc.`)
      : z.unknown().optional();
  }

  return z.object(shape);
}

function valueForForm(field: RecordField, value: unknown) {
  if (field.type === "checkbox") return Boolean(value);
  if (field.type === "lines" && Array.isArray(value)) return value.join("\n");
  if (value === null || value === undefined) return "";
  return value;
}

function defaultValues(schema: TableSchema, row?: Record<string, unknown>) {
  const values: Record<string, unknown> = {};

  for (const field of schema.fields) {
    const fallback = schema.defaultValues?.[field.name] ?? (field.type === "checkbox" ? false : "");
    values[field.name] = valueForForm(field, row ? row[field.name] : fallback);
  }

  return values;
}

function labelForOption(field: RecordField, value: unknown) {
  const stringValue = String(value ?? "");
  return field.options?.find((option) => option.value === stringValue)?.label ?? stringValue;
}

function formatDisplayValue(field: RecordField, value: unknown) {
  if (value === null || value === undefined || value === "") return "Chưa có";
  if (field.type === "checkbox") return value ? "Đã xong" : "Chưa xong";
  if (field.type === "date") return formatDate(String(value));
  if (field.type === "select") return labelForOption(field, value);
  if (field.type === "lines" && Array.isArray(value)) return value.length ? value.join(" · ") : "Chưa có";
  if (field.type === "number") {
    const numberValue = Number(value);
    if (field.name === "amount") return formatCurrency(numberValue);
    return formatNumber(numberValue);
  }
  return String(value);
}

function deriveFilterOptions(rows: Array<Record<string, unknown>>, field: RecordField) {
  if (field.options?.length) return field.options;

  return Array.from(new Set(rows.map((row) => row[field.name]).filter(Boolean).map(String))).map((value) => ({
    label: value,
    value
  }));
}

export function RecordManager({
  table,
  path,
  title,
  description,
  createLabel,
  emptyTitle,
  emptyDescription,
  schema,
  rows,
  filterFields = []
}: RecordManagerConfig) {
  const [editingRow, setEditingRow] = useState<Record<string, unknown> | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();
  const resolverSchema = useMemo(() => buildClientSchema(schema.fields), [schema.fields]);
  const form = useForm<FieldValues>({
    resolver: zodResolver(resolverSchema),
    defaultValues: defaultValues(schema)
  });

  const listFields = schema.fields.filter((field) => field.list);
  const activeFilterFields = schema.fields.filter((field) => filterFields.includes(field.name));
  const filteredRows = rows.filter((row) =>
    Object.entries(filters).every(([fieldName, value]) => !value || String(row[fieldName] ?? "") === value)
  );

  function resetForm() {
    setEditingRow(null);
    form.reset(defaultValues(schema));
  }

  function startEdit(row: Record<string, unknown>) {
    setEditingRow(row);
    form.reset(defaultValues(schema, row));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function submit(values: FieldValues) {
    startTransition(async () => {
      const result = await upsertRecord({
        table,
        id: typeof editingRow?.id === "string" ? editingRow.id : undefined,
        values,
        path
      });

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      resetForm();
    });
  }

  function remove(row: Record<string, unknown>) {
    const id = row.id;
    if (typeof id !== "string") return;

    const confirmed = window.confirm("Bạn muốn xóa bản ghi này?");
    if (!confirmed) return;

    startTransition(async () => {
      const result = await deleteRecord({ table, id, path });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
    });
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <PremiumCard hover={false}>
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">{editingRow ? "Chỉnh sửa bản ghi" : title}</h2>
            <p className="mt-2 text-sm leading-6 text-text-secondary">{description}</p>
          </div>
          {editingRow ? (
            <Button type="button" variant="ghost" size="icon" onClick={resetForm} aria-label="Hủy chỉnh sửa">
              <X className="size-4" />
            </Button>
          ) : null}
        </div>

        <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit(submit)}>
          {schema.fields.map((field) => {
            const error = form.formState.errors[field.name]?.message;

            if (field.type === "textarea" || field.type === "lines") {
              return (
                <div key={field.name} className={field.wide ? "space-y-2 md:col-span-2" : "space-y-2"}>
                  <Label htmlFor={field.name}>{field.label}</Label>
                  <Textarea
                    id={field.name}
                    placeholder={field.placeholder}
                    {...form.register(field.name)}
                    rows={field.type === "lines" ? 5 : 4}
                  />
                  {field.helper ? <p className="text-xs leading-5 text-text-secondary">{field.helper}</p> : null}
                  {typeof error === "string" ? <p className="text-sm text-rose-600">{error}</p> : null}
                </div>
              );
            }

            if (field.type === "select") {
              return (
                <div key={field.name} className={field.wide ? "space-y-2 md:col-span-2" : "space-y-2"}>
                  <Label htmlFor={field.name}>{field.label}</Label>
                  <Select id={field.name} {...form.register(field.name)}>
                    <option value="">Chọn {field.label.toLowerCase()}</option>
                    {field.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                  {typeof error === "string" ? <p className="text-sm text-rose-600">{error}</p> : null}
                </div>
              );
            }

            if (field.type === "checkbox") {
              return (
                <div key={field.name} className="flex items-center rounded-2xl border border-border-soft bg-white/55 p-4 md:col-span-2">
                  <Checkbox label={field.label} {...form.register(field.name)} />
                </div>
              );
            }

            return (
              <div key={field.name} className={field.wide ? "space-y-2 md:col-span-2" : "space-y-2"}>
                <Label htmlFor={field.name}>{field.label}</Label>
                <Input
                  id={field.name}
                  type={field.type}
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  placeholder={field.placeholder}
                  {...form.register(field.name)}
                />
                {typeof error === "string" ? <p className="text-sm text-rose-600">{error}</p> : null}
              </div>
            );
          })}

          <div className="flex flex-col gap-3 md:col-span-2 sm:flex-row">
            <Button type="submit" disabled={isPending}>
              {editingRow ? <Save className="size-4" /> : <Plus className="size-4" />}
              {isPending ? "Đang lưu..." : editingRow ? "Lưu thay đổi" : createLabel}
            </Button>
            {editingRow ? (
              <Button type="button" variant="secondary" onClick={resetForm}>
                Hủy
              </Button>
            ) : null}
          </div>
        </form>
      </PremiumCard>

      <PremiumCard hover={false}>
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">Dữ liệu đã lưu</h2>
            <p className="mt-2 text-sm text-text-secondary">{filteredRows.length} bản ghi đang hiển thị</p>
          </div>
          {activeFilterFields.length ? (
            <div className="flex flex-wrap gap-2">
              {activeFilterFields.map((field) => (
                <div key={field.name} className="relative">
                  <Filter className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-text-secondary" />
                  <select
                    aria-label={`Lọc ${field.label}`}
                    className="h-9 rounded-full border border-border-soft bg-white/75 pl-9 pr-4 text-xs font-semibold text-text-secondary outline-none transition focus:ring-4 focus:ring-primary-indigo/15"
                    value={filters[field.name] ?? ""}
                    onChange={(event) => setFilters((current) => ({ ...current, [field.name]: event.target.value }))}
                  >
                    <option value="">Tất cả {field.label.toLowerCase()}</option>
                    {deriveFilterOptions(rows, field).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {filteredRows.length ? (
          <div className="scrollbar-soft max-h-[720px] space-y-3 overflow-y-auto pr-1">
            {filteredRows.map((row) => {
              const title = String(row[schema.titleField] ?? "Bản ghi");
              const subtitle = schema.subtitleField ? row[schema.subtitleField] : null;

              return (
                <article key={String(row.id)} className="rounded-[24px] border border-border-soft bg-white/58 p-4 shadow-[0_14px_42px_rgba(15,23,42,0.05)]">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-bold text-text-primary">{title}</h3>
                      {subtitle ? <p className="mt-1 truncate text-sm text-text-secondary">{formatDisplayValue({ name: schema.subtitleField ?? "", label: "", type: "text" }, subtitle)}</p> : null}
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button type="button" variant="ghost" size="icon" onClick={() => startEdit(row)} aria-label="Chỉnh sửa">
                        <Edit3 className="size-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="icon" onClick={() => remove(row)} aria-label="Xóa">
                        <Trash2 className="size-4 text-rose-500" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {listFields.map((field) => (
                      <Badge key={field.name} variant={field.type === "checkbox" && row[field.name] ? "cyan" : "neutral"}>
                        {field.label}: {formatDisplayValue(field, row[field.name])}
                      </Badge>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyState title={emptyTitle} description={emptyDescription} actionLabel="Nhập dữ liệu đầu tiên" onAction={() => window.scrollTo({ top: 0, behavior: "smooth" })} />
        )}
      </PremiumCard>
    </section>
  );
}
