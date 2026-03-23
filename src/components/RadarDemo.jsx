import React from "react";
import { Radar, IconContainer } from "./ui/radar-effect";
import { Activity, Search, ShieldAlert, TrendingUp, Users, Target } from "lucide-react";

export function RadarDemo() {
  return (
    <div className="flex w-full items-center justify-center overflow-hidden rounded-[2rem] border border-white/5 bg-slate-950/50 py-12 relative my-10 shadow-[inset_0_0_80px_rgba(0,0,0,0.8)]">
      <div className="relative flex h-96 w-full max-w-3xl flex-col items-center justify-center space-y-4 px-4">
        {/* Row 1 */}
        <div className="mx-auto w-full max-w-3xl">
          <div className="flex w-full items-center justify-center space-x-10 md:justify-between md:space-x-0">
            <IconContainer
              text="Social Velocity"
              delay={0.2}
              icon={<TrendingUp className="h-8 w-8 text-cyan-400" strokeWidth={1.5} />}
            />
            <IconContainer
              delay={0.4}
              text="Smart Money"
              icon={<Target className="h-8 w-8 text-fuchsia-400" strokeWidth={1.5} />}
            />
            <IconContainer
              text="Bot Activity"
              delay={0.3}
              icon={<Activity className="h-8 w-8 text-rose-400" strokeWidth={1.5} />}
            />
          </div>
        </div>
        {/* Row 2 */}
        <div className="mx-auto w-full max-w-md mt-8">
          <div className="flex w-full items-center justify-center space-x-10 md:justify-between md:space-x-0">
            <IconContainer
              text="Liquidity Pools"
              delay={0.5}
              icon={<Search className="h-8 w-8 text-emerald-400" strokeWidth={1.5} />}
            />
            <IconContainer
              text="Risk Assessment"
              delay={0.8}
              icon={<ShieldAlert className="h-8 w-8 text-amber-400" strokeWidth={1.5} />}
            />
          </div>
        </div>
        {/* Row 3 */}
        <div className="mx-auto w-full max-w-3xl mt-8">
          <div className="flex w-full items-center justify-center space-x-10 md:justify-between md:space-x-0">
            <IconContainer
              delay={0.6}
              text="Wallet Tracking"
              icon={<Users className="h-8 w-8 text-indigo-400" strokeWidth={1.5} />}
            />
            <IconContainer
              delay={0.7}
              text="Contract Audit"
              icon={<ShieldAlert className="h-8 w-8 text-slate-400" strokeWidth={1.5} />}
            />
          </div>
        </div>

        <Radar className="absolute -bottom-12" />
        <div className="absolute bottom-0 z-[41] h-[1px] w-full bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
      </div>
    </div>
  );
}
