-- HR 驾驶舱数据库表结构
-- 在 Supabase SQL Editor 中执行

-- 启用 RLS（行级安全）
alter table if exists "public"."kpi_data" enable row level security;
alter table if exists "public"."recruit_data" enable row level security;
alter table if exists "public"."anomaly_data" enable row level security;
alter table if exists "public"."product_data" enable row level security;
alter table if exists "public"."historical_months" enable row level security;

-- 1. KPI 数据表（首页数据）
create table if not exists "public"."kpi_data" (
  "id" uuid default gen_random_uuid() primary key,
  "month" text not null, -- 格式: YYYY-MM
  "bg_name" text not null default 'CBG', -- 业务群名称
  "total_headcount" integer default 0, -- 总人数
  "regular_staff" integer default 0, -- 正编人数
  "outsourced_staff" integer default 0, -- 外包人数
  "total_quota" integer default 0, -- 总编制
  "regular_quota" integer default 0, -- 正编编制
  "outsourced_quota" integer default 0, -- 外包编制
  "vacancy_regular" integer default 0, -- 正编空编
  "vacancy_outsourced" integer default 0, -- 外包空编
  "new_hires" integer default 0, -- 本月入职
  "resignations" integer default 0, -- 本月离职
  "attrition_rate" numeric(5,2) default 0, -- 离职率
  "active_attrition" numeric(5,2) default 0, -- 主动离职率
  "passive_attrition" numeric(5,2) default 0, -- 被动离职率
  "created_at" timestamp with time zone default now(),
  "updated_at" timestamp with time zone default now(),
  unique("month", "bg_name")
);

-- 2. 招聘数据表
create table if not exists "public"."recruit_data" (
  "id" uuid default gen_random_uuid() primary key,
  "month" text not null,
  "bg_name" text not null default 'CBG',
  "total_demand" integer default 0, -- 总需求
  "completed" integer default 0, -- 已完成
  "completion_rate" numeric(5,2) default 0, -- 完成率
  "hired_this_month" integer default 0, -- 本月入职
  "offered" integer default 0, -- 已发 offer
  "pending_offer" integer default 0, -- 待发 offer
  "interviewed" integer default 0, -- 已面试
  "overseas_demand" integer default 0, -- 出海需求
  "overseas_completed" integer default 0, -- 出海完成
  "overseas_rate" numeric(5,2) default 0, -- 出海完成率
  "a_class_demand" integer default 0, -- A类需求
  "a_class_completed" integer default 0, -- A类完成
  "a_class_rate" numeric(5,2) default 0, -- A类完成率
  "created_at" timestamp with time zone default now(),
  "updated_at" timestamp with time zone default now(),
  unique("month", "bg_name")
);

-- 3. 异动明细表
create table if not exists "public"."anomaly_data" (
  "id" uuid default gen_random_uuid() primary key,
  "month" text not null,
  "bg_name" text not null default 'CBG',
  "type" text not null, -- 类型: 入职、离职、主动离职、被动离职、月度净增等
  "count" integer default 0,
  "pct" text default '-',
  "note" text default '',
  "sort_order" integer default 0, -- 排序
  "created_at" timestamp with time zone default now(),
  "updated_at" timestamp with time zone default now(),
  unique("month", "bg_name", "type")
);

-- 4. 产线数据表
create table if not exists "public"."product_data" (
  "id" uuid default gen_random_uuid() primary key,
  "month" text not null,
  "product_line" text not null, -- 产线名称
  "headcount" integer default 0, -- 在职人数
  "demand" integer default 0, -- 需求
  "vacancy" integer default 0, -- 空编
  "attrition_rate" numeric(5,2) default 0, -- 离职率
  "bg_name" text not null default 'CBG',
  "created_at" timestamp with time zone default now(),
  "updated_at" timestamp with time zone default now(),
  unique("month", "bg_name", "product_line")
);

-- 5. 历史月份记录表（用于版本控制）
create table if not exists "public"."historical_months" (
  "id" uuid default gen_random_uuid() primary key,
  "month" text not null,
  "bg_name" text not null default 'CBG',
  "data_type" text not null, -- kpi, recruit, anomaly, product
  "version" integer default 1,
  "snapshot" jsonb not null, -- 完整数据快照
  "imported_by" uuid references auth.users(id),
  "imported_at" timestamp with time zone default now(),
  "note" text default '',
  created_at timestamp with time zone default now()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_kpi_month ON "public"."kpi_data"("month");
CREATE INDEX IF NOT EXISTS idx_recruit_month ON "public"."recruit_data"("month");
CREATE INDEX IF NOT EXISTS idx_anomaly_month ON "public"."anomaly_data"("month");
CREATE INDEX IF NOT EXISTS idx_product_month ON "public"."product_data"("month");
CREATE INDEX IF NOT EXISTS idx_historical_month ON "public"."historical_months"("month");

-- RLS 策略：允许认证用户读写
CREATE POLICY "Allow authenticated users to select kpi_data" 
  ON "public"."kpi_data" FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert kpi_data" 
  ON "public"."kpi_data" FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update kpi_data" 
  ON "public"."kpi_data" FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to select recruit_data" 
  ON "public"."recruit_data" FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert recruit_data" 
  ON "public"."recruit_data" FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update recruit_data" 
  ON "public"."recruit_data" FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to select anomaly_data" 
  ON "public"."anomaly_data" FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert anomaly_data" 
  ON "public"."anomaly_data" FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update anomaly_data" 
  ON "public"."anomaly_data" FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to select product_data" 
  ON "public"."product_data" FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert product_data" 
  ON "public"."product_data" FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update product_data" 
  ON "public"."product_data" FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to select historical_months" 
  ON "public"."historical_months" FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert historical_months" 
  ON "public"."historical_months" FOR INSERT TO authenticated WITH CHECK (true);