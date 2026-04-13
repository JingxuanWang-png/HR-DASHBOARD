-- 启用 RLS
ALTER TABLE "public"."kpi_data" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."recruit_data" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."anomaly_data" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."product_data" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."historical_months" ENABLE ROW LEVEL SECURITY;

-- RLS 策略
CREATE POLICY "Allow authenticated users to select kpi_data" ON "public"."kpi_data" FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert kpi_data" ON "public"."kpi_data" FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update kpi_data" ON "public"."kpi_data" FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to select recruit_data" ON "public"."recruit_data" FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert recruit_data" ON "public"."recruit_data" FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update recruit_data" ON "public"."recruit_data" FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to select anomaly_data" ON "public"."anomaly_data" FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert anomaly_data" ON "public"."anomaly_data" FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update anomaly_data" ON "public"."anomaly_data" FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to select product_data" ON "public"."product_data" FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert product_data" ON "public"."product_data" FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update product_data" ON "public"."product_data" FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to select historical_months" ON "public"."historical_months" FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert historical_months" ON "public"."historical_months" FOR INSERT TO authenticated WITH CHECK (true);
