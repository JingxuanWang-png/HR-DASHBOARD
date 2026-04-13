-- 第一步：删除旧表（如果存在）
DROP TABLE IF EXISTS "public"."historical_months";
DROP TABLE IF EXISTS "public"."product_data";
DROP TABLE IF EXISTS "public"."anomaly_data";
DROP TABLE IF EXISTS "public"."recruit_data";
DROP TABLE IF EXISTS "public"."kpi_data";

-- 第二步：创建 KPI 数据表
CREATE TABLE "public"."kpi_data" (
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "month" text NOT NULL,
  "bg_name" text NOT NULL DEFAULT 'CBG',
  "total_headcount" integer DEFAULT 0,
  "regular_staff" integer DEFAULT 0,
  "outsourced_staff" integer DEFAULT 0,
  "total_quota" integer DEFAULT 0,
  "regular_quota" integer DEFAULT 0,
  "outsourced_quota" integer DEFAULT 0,
  "vacancy_regular" integer DEFAULT 0,
  "vacancy_outsourced" integer DEFAULT 0,
  "new_hires" integer DEFAULT 0,
  "resignations" integer DEFAULT 0,
  "attrition_rate" numeric(5,2) DEFAULT 0,
  "active_attrition" numeric(5,2) DEFAULT 0,
  "passive_attrition" numeric(5,2) DEFAULT 0,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  UNIQUE("month", "bg_name")
);

-- 第三步：创建招聘数据表
CREATE TABLE "public"."recruit_data" (
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "month" text NOT NULL,
  "bg_name" text NOT NULL DEFAULT 'CBG',
  "total_demand" integer DEFAULT 0,
  "completed" integer DEFAULT 0,
  "completion_rate" numeric(5,2) DEFAULT 0,
  "hired_this_month" integer DEFAULT 0,
  "offered" integer DEFAULT 0,
  "pending_offer" integer DEFAULT 0,
  "interviewed" integer DEFAULT 0,
  "overseas_demand" integer DEFAULT 0,
  "overseas_completed" integer DEFAULT 0,
  "overseas_rate" numeric(5,2) DEFAULT 0,
  "a_class_demand" integer DEFAULT 0,
  "a_class_completed" integer DEFAULT 0,
  "a_class_rate" numeric(5,2) DEFAULT 0,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  UNIQUE("month", "bg_name")
);

-- 第四步：创建异动明细表
CREATE TABLE "public"."anomaly_data" (
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "month" text NOT NULL,
  "bg_name" text NOT NULL DEFAULT 'CBG',
  "type" text NOT NULL,
  "count" integer DEFAULT 0,
  "pct" text DEFAULT '-',
  "note" text DEFAULT '',
  "sort_order" integer DEFAULT 0,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  UNIQUE("month", "bg_name", "type")
);

-- 第五步：创建产线数据表
CREATE TABLE "public"."product_data" (
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "month" text NOT NULL,
  "bg_name" text NOT NULL DEFAULT 'CBG',
  "product_line" text NOT NULL,
  "headcount" integer DEFAULT 0,
  "demand" integer DEFAULT 0,
  "vacancy" integer DEFAULT 0,
  "attrition_rate" numeric(5,2) DEFAULT 0,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  UNIQUE("month", "bg_name", "product_line")
);

-- 第六步：创建历史月份记录表
CREATE TABLE "public"."historical_months" (
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "month" text NOT NULL,
  "bg_name" text NOT NULL DEFAULT 'CBG',
  "data_type" text NOT NULL,
  "version" integer DEFAULT 1,
  "snapshot" jsonb NOT NULL,
  "imported_by" uuid REFERENCES auth.users(id),
  "imported_at" timestamp with time zone DEFAULT now(),
  "note" text DEFAULT '',
  "created_at" timestamp with time zone DEFAULT now()
);
