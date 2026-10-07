import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

export default function ReadinessRadar({ data }) {
  const chartData = [
    { subject: 'Resume', score: data?.resume || 84, fullMark: 100 },
    { subject: 'Technical Skills', score: data?.technicalSkills || 72, fullMark: 100 },
    { subject: 'Projects', score: data?.projects || 81, fullMark: 100 },
    { subject: 'Interview Skills', score: data?.interviewSkills || 68, fullMark: 100 },
    { subject: 'Communication', score: data?.communication || 75, fullMark: 100 },
  ];

  return (
    <div className="w-full h-64 sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
          <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" tick={{ fontSize: 10 }} />
          <Radar
            name="Readiness Score"
            dataKey="score"
            stroke="#6366f1"
            fill="#6366f1"
            fillOpacity={0.4}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="p-2.5 rounded-xl bg-slate-900 text-white text-xs shadow-lg">
                    <p className="font-semibold">{payload[0].payload.subject}</p>
                    <p className="text-indigo-300 font-bold">{payload[0].value} / 100</p>
                  </div>
                );
              }
              return null;
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
