import React from "react";
import { Radio } from "lucide-react";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { MapContainer } from "@/shared/components/map/MapContainer";
import { Badge } from "@/shared/components/ui/badge";

export const TrackingPage: React.FC = () => {
  usePageTitle("Giám sát Realtime");

  return (
    <PageContainer
      title="Giám sát Realtime"
      subtitle="Bản đồ theo dõi vị trí GPS và thông số vận hành của hạm đội xe trực tuyến."
      action={
        <Badge variant="info" className="gap-1.5 py-1 px-3">
          <Radio className="h-3.5 w-3.5" />
          MapLibre GL JS Foundation Ready
        </Badge>
      }
      fullHeight
    >
      <div className="h-full w-full rounded-lg overflow-hidden border border-border shadow-2xs">
        <MapContainer />
      </div>
    </PageContainer>
  );
};
