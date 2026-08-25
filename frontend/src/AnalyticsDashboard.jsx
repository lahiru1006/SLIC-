import React, { useEffect, useState } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid
} from 'recharts';

// Pie Chart සහ Bar Chart සඳහා භාවිතා කරන Color Palette එක
const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#3B82F6'];

export default function AnalyticsDashboard() {
  const [categoryData, setCategoryData] = useState([]);
  const [zoneData, setZoneData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/am-analytics')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch backend analytics');
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          setCategoryData(data.categories || []);
          setZoneData(data.zones || []);
        } else {
          setError(data.message);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div style={{ padding: '60px', textAlign: 'center', fontSize: '16px', color: '#4B5563' }}>
      ⏳ Loading Oracle Analytics...
    </div>
  );

  if (error) return (
    <div style={{ padding: '40px', color: '#EF4444', textAlign: 'center', fontWeight: 'bold' }}>
      ❌ Error: {error}
    </div>
  );

  return (
    <div style={{ padding: '30px', backgroundColor: '#F9FAFB', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <h2 style={{ marginBottom: '24px', color: '#111827', fontWeight: '700' }}>
        Activity Monitoring Analytics
      </h2>

      {/* 1. Category Pie Chart */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <h3 style={{ color: '#374151', marginBottom: '15px', fontSize: '18px', fontWeight: '600' }}>
            Users by Category
          </h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie 
                  data={categoryData} 
                  dataKey="count" 
                  nameKey="category" 
                  cx="50%" 
                  cy="50%" 
                  outerRadius={100} 
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((_, i) => (
                    <Cell key={`cat-cell-${i}`} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} Users`, 'Count']} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', color: '#9CA3AF' }}>No Category Data Available</div>
          )}
        </div>
      </div>

      {/* 2. Zone-wise Active Users Bar Chart */}
      <div style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
        <h3 style={{ color: '#374151', marginBottom: '15px', fontSize: '18px', fontWeight: '600' }}>
          Active Users by Zone
        </h3>
        {zoneData.length > 0 ? (
          <ResponsiveContainer width="100%" height={380}>
            <BarChart data={zoneData} margin={{ top: 25, right: 30, left: 10, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis 
                dataKey="zone" 
                interval={0} 
                angle={-10} 
                textAnchor="end"
                tick={{ fontSize: 13, fill: '#4B5563', fontWeight: 500 }} 
              />
              <YAxis tick={{ fontSize: 12, fill: '#4B5563' }} />
              <Tooltip 
                cursor={{ fill: 'rgba(243, 244, 246, 0.8)' }}
                formatter={(value) => [`${value} Users`, 'Active Users']} 
              />
              <Bar 
                dataKey="userCount" 
                name="Active Users" 
                radius={[6, 6, 0, 0]} 
                barSize={50}
                label={{ position: 'top', fill: '#374151', fontSize: 12, fontWeight: 600 }}
              >
                {zoneData.map((_, index) => (
                  <Cell key={`zone-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ padding: '20px', textAlign: 'center', color: '#9CA3AF' }}>No Zone Data Available</div>
        )}
      </div>
    </div>
  );
}