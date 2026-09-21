import React, { useState } from "react";
import {
  Shield,
  Gauge,
  Fuel,
  FileCheck2,
  Radio,
  Warehouse,
  ToggleLeft,
  ToggleRight,
  Settings2,
} from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/utils/cn";
import {
  DEFAULT_ALERT_RULES,
  type AlertRule,
  type AlertRuleType,
} from "../types/notification";

const RULE_ICONS: Record<AlertRuleType, React.ComponentType<{ className?: string }>> = {
  SLA_BREACH: Shield,
  SPEED_LIMIT: Gauge,
  LOW_FUEL: Fuel,
  INSPECTION_EXPIRY: FileCheck2,
  GPS_LOST: Radio,
  CAPACITY_WARNING: Warehouse,
};

const SEVERITY_COLORS: Record<string, string> = {
  URGENT: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  HIGH: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  NORMAL: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  LOW: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
};

export const AlertRulesManager: React.FC = () => {
  const [rules, setRules] = useState<AlertRule[]>(DEFAULT_ALERT_RULES);

  const toggleRule = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const updateThreshold = (id: string, threshold: number) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, threshold } : r))
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Settings2 className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Quy tắc Cảnh báo Tự động</h3>
            <p className="text-[11px] text-muted-foreground">
              Cấu hình các ngưỡng cảnh báo tự động cho hệ thống vận hành
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="text-[10px] h-5 px-2 font-bold">
          {rules.filter((r) => r.enabled).length}/{rules.length} đang bật
        </Badge>
      </div>

      {/* Rules List */}
      <div className="space-y-2.5">
        {rules.map((rule) => {
          const RuleIcon = RULE_ICONS[rule.type];
          return (
            <div
              key={rule.id}
              className={cn(
                "flex items-center gap-4 rounded-xl border px-4 py-3.5 transition-all",
                rule.enabled
                  ? "bg-card border-border/60"
                  : "bg-muted/20 border-border/30 opacity-60"
              )}
            >
              {/* Icon */}
              <div
                className={cn(
                  "h-10 w-10 rounded-lg flex items-center justify-center border shrink-0",
                  SEVERITY_COLORS[rule.severity]
                )}
              >
                <RuleIcon className="h-4.5 w-4.5" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{rule.name}</span>
                  <Badge
                    variant="outline"
                    className={cn("text-[9px] h-4 px-1.5 font-bold border", SEVERITY_COLORS[rule.severity])}
                  >
                    {rule.severity}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">{rule.description}</p>
                <div className="flex items-center gap-1.5 pt-0.5">
                  {rule.notifyRoles.map((role) => (
                    <Badge
                      key={role}
                      variant="secondary"
                      className="text-[9px] h-4 px-1 font-medium"
                    >
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Threshold control */}
              {rule.threshold !== undefined && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <Input
                    type="number"
                    value={rule.threshold}
                    onChange={(e) => updateThreshold(rule.id, Number(e.target.value))}
                    disabled={!rule.enabled}
                    className="w-16 h-8 text-xs text-center font-mono font-bold tabular-nums"
                  />
                  <span className="text-[11px] text-muted-foreground font-medium min-w-[32px]">
                    {rule.unit}
                  </span>
                </div>
              )}

              {/* Toggle */}
              <button
                onClick={() => toggleRule(rule.id)}
                className="shrink-0 cursor-pointer transition-colors"
                title={rule.enabled ? "Tắt quy tắc" : "Bật quy tắc"}
              >
                {rule.enabled ? (
                  <ToggleRight className="h-7 w-7 text-primary" />
                ) : (
                  <ToggleLeft className="h-7 w-7 text-muted-foreground/40" />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
