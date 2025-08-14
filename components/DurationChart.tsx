'use client';

import { faker } from '@faker-js/faker';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export default function DurationChart() {
  // Generate fake data for stay durations
  const generateStayDurationData = () => {
    return [
      {
        name: '1-2 nights',
        value: faker.number.int({ min: 15, max: 30 }),
        color: '#3b82f6', // blue
      },
      {
        name: '3-4 nights',
        value: faker.number.int({ min: 20, max: 35 }),
        color: '#10b981', // green
      },
      {
        name: '5-7 nights',
        value: faker.number.int({ min: 25, max: 40 }),
        color: '#f59e0b', // amber
      },
      {
        name: '8-14 nights',
        value: faker.number.int({ min: 10, max: 25 }),
        color: '#8b5cf6', // purple
      },
      {
        name: '15+ nights',
        value: faker.number.int({ min: 5, max: 15 }),
        color: '#ef4444', // red
      },
    ];
  };

  const data = generateStayDurationData();

  // Sort data by value in descending order for legend
  const sortedData = [...data].sort((a, b) => b.value - a.value);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const total = sortedData.reduce((sum, item) => sum + item.value, 0);
      return (
        <div className="bg-content1 p-3 border border-divider rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-default-600">
            {data.value} bookings ({((data.value / total) * 100).toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-content1 p-4 md:p-6 rounded-lg border border-divider h-auto md:h-96">
      <h3 className="text-lg md:text-xl font-bold mb-4">Stay Duration Distribution</h3>
      
      {/* Mobile Layout - Stack vertically */}
      <div className="md:hidden">
        <div className="h-64 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={sortedData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {sortedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {sortedData.map((entry, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs font-medium truncate">{entry.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Layout - Side by side */}
      <div className="hidden md:block h-80">
        <div className="h-full flex">
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sortedData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {sortedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-40 flex flex-col justify-center pl-4">
            <div className="space-y-3">
              {sortedData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm font-medium">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
