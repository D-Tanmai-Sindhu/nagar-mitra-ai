import React, { useMemo, useState } from "react";
import { APIProvider, Map, Marker, InfoWindow } from "@vis.gl/react-google-maps";
import { Layers, MapPin } from "lucide-react";
import { CivicReport } from "../types";

interface CivicIssuesMapProps {
  reports: CivicReport[];
  onSelectReport?: (id: string) => void;
}

const getMarkerColor = (report: CivicReport) => {
  if (report.status === "Resolved") return "#22c55e";
  if (report.severity === "Critical" || report.severity === "High")
    return "#ef4444";
  return "#eab308";
};

export const CivicIssuesMap: React.FC<CivicIssuesMapProps> = ({
  reports,
  onSelectReport,
}) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_PLATFORM_KEY as string;

  const [selected, setSelected] = useState<CivicReport | null>(null);

  const tagged = useMemo(() => {
    return reports.filter(
      (r) =>
        r.status !== "Resolved" &&
        r.latitude != null &&
        r.longitude != null &&
        !isNaN(Number(r.latitude)) &&
        !isNaN(Number(r.longitude))
    );
  }, [reports]);

  const center = { lat: 17.385, lng: 78.4867 };

  if (!apiKey) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center text-white">
        Google Maps API key missing (check .env)
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 bg-slate-900 p-5 rounded-2xl border border-slate-800">
        <Layers className="text-teal-400" />
        <div>
          <h2 className="text-white font-bold">Hyderabad Live Civic Map</h2>
          <p className="text-xs text-slate-400">
            {tagged.length} active GPS reports
          </p>
        </div>
      </div>

      <div className="h-[500px] rounded-3xl overflow-hidden border border-slate-800">
        <APIProvider apiKey={apiKey}>
          <Map
            defaultCenter={center}
            defaultZoom={12}
            gestureHandling="greedy"
            mapId="DEMO_MAP_ID"
          >
            {tagged.map((report) => (
              <Marker
                key={report.id}
                position={{
                  lat: Number(report.latitude),
                  lng: Number(report.longitude),
                }}
                onClick={() => setSelected(report)}
                title={report.title}
              />
            ))}

            {selected && (
              <InfoWindow
                position={{
                  lat: Number(selected.latitude),
                  lng: Number(selected.longitude),
                }}
                onCloseClick={() => setSelected(null)}
              >
                <div className="p-3 text-black">
                  <h3 className="font-bold">{selected.category}</h3>
                  <p>{selected.location}</p>
                  <p>Status: {selected.status}</p>
                  <p style={{ color: getMarkerColor(selected) }}>
                    {selected.severity}
                  </p>

                  {onSelectReport && (
                    <button
                      className="mt-2 text-blue-600 underline"
                      onClick={() => {
                        onSelectReport(selected.id);
                        setSelected(null);
                      }}
                    >
                      View Report
                    </button>
                  )}
                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>
      </div>
    </div>
  );
};