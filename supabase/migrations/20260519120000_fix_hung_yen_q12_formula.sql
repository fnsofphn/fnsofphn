update public.giup_cy_exam_questions q
set prompt = 'Cho biết: E₀(Fe²⁺/Fe) = -0,440V; E₀(Cu²⁺/Cu) = +0,340V. Sức điện động chuẩn của pin điện hoá Fe - Cu là'
where q.question_number = 12
  and exists (
    select 1
    from public.giup_cy_exams e
    where e.id = q.exam_id
      and e.slug = 'hung-yen-hki-hoa-12-2026-3d1d5844'
  );
