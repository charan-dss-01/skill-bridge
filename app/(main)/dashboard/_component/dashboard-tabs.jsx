"use client";

import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BarChart3, Target } from "lucide-react";
import DashboardView from "./dashboard-view";
import SkillGapView from "./skill-gap-view";

const DashboardTabs = ({ insights }) => {
    return (
        <div>
            <Tabs defaultValue="insights" className="w-full">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-5 gap-4">
                    <h1 className="text-6xl font-bold gradient-title">Dashboard</h1>
                    <TabsList>
                        <TabsTrigger value="insights" className="gap-2">
                            <BarChart3 className="h-4 w-4" />
                            Industry Insights
                        </TabsTrigger>
                        <TabsTrigger value="skill-gap" className="gap-2">
                            <Target className="h-4 w-4" />
                            Skill Gap Analyzer
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="insights">
                    <DashboardView insights={insights} />
                </TabsContent>

                <TabsContent value="skill-gap">
                    <SkillGapView />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default DashboardTabs;
