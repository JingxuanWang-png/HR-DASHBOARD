-- 创建索引
CREATE INDEX idx_kpi_month ON "public"."kpi_data"("month");
CREATE INDEX idx_recruit_month ON "public"."recruit_data"("month");
CREATE INDEX idx_anomaly_month ON "public"."anomaly_data"("month");
CREATE INDEX idx_product_month ON "public"."product_data"("month");
CREATE INDEX idx_historical_month ON "public"."historical_months"("month");
