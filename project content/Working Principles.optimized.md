# Working Principles - Optimized

## 1. Correctness First
- Uu tien dung 100% hon toc do giao hang khi co xung dot.
- Khong doan voi quyet dinh quan trong; phai kiem chung bang code, logs, tests, va hanh vi runtime.

## 2. UTF-8 And Vietnamese
- Dung UTF-8 cho source, config, docs.
- Giu dung dau tieng Viet; khong tao loi encoding.

## 3. Preserve Working Logic
- Giu logic nghiep vu dang on dinh.
- Tranh refactor rong neu khong can thiet.
- Di theo pattern hien co cua project, tru khi co ly do ky thuat ro rang de doi.

## 4. Scope And Regression
- Truoc khi sua, kiem tra luong dung chung: role, route, state/cache, API/service, va cac man hinh lien quan.
- Neu loi xuat hien o mot man/role, kiem tra xem nguyen nhan co nam o lop dung chung hay khong.
- Khi cham logic dung chung, chay kiem tra hoi quy phu hop cho cac man/role bi anh huong.

## 5. Runtime Verification
- Voi app can runtime, khoi dong dev server de kiem tra.
- Neu port mac dinh bi chiem, dung port khac va bao URL local.
- Toi thieu phai chay test/unit test neu project co test.

## 6. Git Policy
- Chi commit/push khi duoc yeu cau ro.
- Neu khong duoc yeu cau, dung o code changes + bao cao validation.

## 7. Ask-First Cases
- Hoi truoc neu thay doi rat lon, ton nhieu thoi gian, hoac co rui ro san pham cao.
- Voi task binh thuong, tu chu thuc hien.

## 8. Reporting
- Bao cao ngan gon: da doi gi, vi sao, da kiem tra bang gi, con rui ro nao.

