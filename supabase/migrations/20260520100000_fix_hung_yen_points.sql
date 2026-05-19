-- Phần I (single_choice, Q1–18): 0.25đ/câu
-- Phần II (true_false, Q19–22): 1đ/câu (partial via grading logic)
-- Phần III (short_answer, Q23–28): 0.25đ/câu
update public.giup_cy_exam_questions q
set points = case
  when q.question_type = 'single_choice' then 0.25
  when q.question_type = 'true_false'    then 1.00
  when q.question_type = 'short_answer'  then 0.25
end
where exists (
  select 1 from public.giup_cy_exams e
  where e.id = q.exam_id
    and e.slug = 'hung-yen-hki-hoa-12-2026-3d1d5844'
);
