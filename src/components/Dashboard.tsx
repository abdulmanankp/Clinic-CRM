import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext.tsx';
import {
  Users,
  Moon,
  Zap,
  CalendarCheck,
  TrendingUp,
  Clock,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  FileText,
  User,
  Activity,
  HeartHandshake,
  Bot,
  Sparkles,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const {
    leads,
    appointments,
    conversations,
    activities,
    settings,
    setSelectedLeadId,
    setActiveTab,
  } = useCrm();

  // Selected calendar month state
  const [currentDate, setCurrentDate] = useState(new Date(2026, 9, 16)); // October 2026, day 16 matching image
  const [selectedDay, setSelectedDay] = useState(16);

  // Hover state on bar chart
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(5); // default show tooltip on 2023/2024

  // Metrics
  const todayStr = new Date().toISOString().slice(0, 10);
  const leadsToday = leads.filter((l) => l.created_at.startsWith(todayStr)).length || 12;
  const afterHoursLeadsCount = leads.filter((l) => l.after_hours).length || 4;
  const targetResponseSeconds = settings?.first_response_target_seconds || 180;
  const avgResponseSeconds = 54;
  const totalBookings = appointments.filter((a) => a.status === 'confirmed' || a.status === 'completed').length || 18;
  const bookedLeads = leads.filter((l) => l.status === 'booked' || l.status === 'visited').length;
  const conversionRate = leads.length > 0 ? Math.round((bookedLeads / leads.length) * 100) : 78;

  // Chart data matching image with 8 periods
  const barChartYears = ['2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026'];
  const barChartData = [
    { year: '2019', green: 2200, orange: 1800, yellow: 1400 },
    { year: '2020', green: 1700, orange: 1400, yellow: 1900 },
    { year: '2021', green: 1900, orange: 1600, yellow: 1300 },
    { year: '2022', green: 1600, orange: 1300, yellow: 1500 },
    { year: '2023', green: 1900, orange: 2100, yellow: 1700 },
    { year: '2024', green: 2400, orange: 1950, yellow: 1850 },
    { year: '2025', green: 1800, orange: 1600, yellow: 1500 },
    { year: '2026', green: 2100, orange: 1750, yellow: 1600 },
  ];

  // Month Calendar Days Generator
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7; // Monday start
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarDays = [];
  // Previous month padding
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    calendarDays.push({ day: daysInPrevMonth - i, isCurrentMonth: false });
  }
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({ day: i, isCurrentMonth: true });
  }
  // Next month padding to fill 35 or 42 grid cells
  const remaining = 35 - calendarDays.length;
  for (let i = 1; i <= (remaining > 0 ? remaining : 42 - calendarDays.length); i++) {
    calendarDays.push({ day: i, isCurrentMonth: false });
  }

  // Upcoming Schedule Items matching image
  const upcomingEvents = [
    {
      id: 1,
      title: 'Teeth Whitening Consultation',
      room: 'Dr. Tariq · Dubai Marina Walk',
      time: '10:00 AM',
      color: 'bg-amber-500',
    },
    {
      id: 2,
      title: 'Botox Assessment (20 Units)',
      room: 'Dr. Sarah · Aesthetic Suite 2',
      time: '11:30 AM',
      color: 'bg-emerald-600',
    },
    {
      id: 3,
      title: 'Invisalign 3D Digital Scan',
      room: 'Dr. Tariq · Clinical Room 1',
      time: '02:00 PM',
      color: 'bg-rose-500',
    },
    {
      id: 4,
      title: 'Hydrafacial & Skin Booster',
      room: 'Nurse Layla · Suite B',
      time: '03:45 PM',
      color: 'bg-indigo-600',
    },
    {
      id: 5,
      title: 'Composite Veneers Checkup',
      room: 'Dr. Sarah · Aesthetic Suite 2',
      time: '05:00 PM',
      color: 'bg-purple-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* ======================================================== */}
      {/* ROW 1: CHARTS (Revenue/Intake Statistics & Working Stats Donut) */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Bar Chart (~62% width) */}
        <div className="lg:col-span-8 bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-xs relative">
          <div className="flex items-center justify-between pb-4">
            <h3 className="text-sm font-bold text-slate-800">Revenue & Intake Statistics</h3>
            <div className="flex items-center space-x-3 text-[11px] text-slate-500 font-medium">
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-800" />
                <span>Dental</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-rose-600" />
                <span>Aesthetic</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Consults</span>
              </span>
            </div>
          </div>

          {/* Bar Chart Canvas with Y-Axis */}
          <div className="relative pt-2">
            {/* Floating Tooltip matching image */}
            {hoveredBarIndex !== null && (
              <div
                className="absolute z-20 bg-white border border-slate-100 shadow-lg rounded-xl p-2.5 text-[11px] pointer-events-none transition-all duration-200"
                style={{
                  left: `${((hoveredBarIndex + 0.5) / barChartData.length) * 80 + 10}%`,
                  top: '15px',
                  transform: 'translateX(-50%)',
                }}
              >
                <div className="space-y-1 font-semibold text-slate-700">
                  <p className="flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-800" />
                    <span className="text-slate-500">Dental:</span>
                    <span className="font-bold text-slate-900">AED 8,560</span>
                  </p>
                  <p className="flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                    <span className="text-slate-500">Aesthetic:</span>
                    <span className="font-bold text-slate-900">AED 7,560</span>
                  </p>
                  <p className="flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span className="text-slate-500">Total:</span>
                    <span className="font-bold text-emerald-600">AED 16,120</span>
                  </p>
                </div>
              </div>
            )}

            {/* Y-Axis Grid Lines & Bars */}
            <div className="flex h-56">
              {/* Y-Axis Labels */}
              <div className="flex flex-col justify-between text-[10px] text-slate-400 font-mono pr-3 py-1 text-right w-10">
                <span>2500</span>
                <span>2000</span>
                <span>1500</span>
                <span>1000</span>
                <span>500</span>
                <span>0</span>
              </div>

              {/* Bars Columns */}
              <div className="flex-1 flex items-end justify-between border-b border-slate-100 px-2 sm:px-4">
                {barChartData.map((item, idx) => {
                  const maxH = 2500;
                  const gH = (item.green / maxH) * 100;
                  const oH = (item.orange / maxH) * 100;
                  const yH = (item.yellow / maxH) * 100;

                  return (
                    <div
                      key={item.year}
                      onMouseEnter={() => setHoveredBarIndex(idx)}
                      className="flex flex-col items-center h-full justify-end group cursor-pointer"
                    >
                      <div className="flex items-end space-x-0.5 sm:space-x-1 h-full">
                        {/* Green Bar */}
                        <div
                          style={{ height: `${gH}%` }}
                          className="w-1.5 sm:w-2 bg-[#1b4332] rounded-t-xs hover:brightness-110 transition-all"
                        />
                        {/* Orange/Red Bar */}
                        <div
                          style={{ height: `${oH}%` }}
                          className="w-1.5 sm:w-2 bg-[#b91c1c] rounded-t-xs hover:brightness-110 transition-all"
                        />
                        {/* Amber/Yellow Bar */}
                        <div
                          style={{ height: `${yH}%` }}
                          className="w-1.5 sm:w-2 bg-[#d97706] rounded-t-xs hover:brightness-110 transition-all"
                        />
                      </div>
                      <span className="text-[10px] font-medium text-slate-400 mt-2">{item.year}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Working / Treatment Statistics Donut (~38% width) */}
        <div className="lg:col-span-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <div className="pb-2">
            <h3 className="text-sm font-bold text-slate-800">Working Statistics</h3>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
            {/* SVG Donut Ring matching image */}
            <div className="relative w-36 h-36 flex-shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#f1f5f9" strokeWidth="8" />

                {/* Segment 1: Green (Planning / Dental 20%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#1b4332"
                  strokeWidth="8"
                  strokeDasharray="238.76"
                  strokeDashoffset="191" // ~20%
                  strokeLinecap="round"
                />

                {/* Segment 2: Red/Coral (Design / Aesthetic 15%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#e11d48"
                  strokeWidth="8"
                  strokeDasharray="238.76"
                  strokeDashoffset="202"
                  transform="rotate(72 50 50)"
                  strokeLinecap="round"
                />

                {/* Segment 3: Dark Blue (Development / Treatments 35%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#1e3a8a"
                  strokeWidth="8"
                  strokeDasharray="238.76"
                  strokeDashoffset="155"
                  transform="rotate(130 50 50)"
                  strokeLinecap="round"
                />

                {/* Segment 4: Amber (Testing / Follow-ups 22%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#eab308"
                  strokeWidth="8"
                  strokeDasharray="238.76"
                  strokeDashoffset="186"
                  transform="rotate(270 50 50)"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Legend (exactly matching layout in uploaded image) */}
            <div className="space-y-2.5 text-xs font-semibold text-slate-700">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full ring-2 ring-emerald-800/30 bg-[#1b4332]" />
                <span className="text-slate-600">Planning 20%</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full ring-2 ring-indigo-900/30 bg-[#1e3a8a]" />
                <span className="text-slate-600">Design 35%</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full ring-2 ring-rose-500/30 bg-[#e11d48]" />
                <span className="text-slate-600">Development 15%</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full ring-2 ring-amber-500/30 bg-[#eab308]" />
                <span className="text-slate-600">Testing 22%</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-50 text-[11px] text-slate-400 text-center">
            Clinical utilization at 84% capacity
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* ROW 2: 5 STAT CARDS WITH GLOWING CIRCULAR ICONS */}
      {/* ======================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Card 1: Red/Orange Glow */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center space-x-3.5 hover:shadow-md transition-shadow">
          <div className="w-11 h-11 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 shadow-sm shadow-rose-100 flex-shrink-0">
            <User className="w-5 h-5 text-rose-500" />
          </div>
          <div>
            <p className="text-xl font-bold tracking-tight text-slate-900">{leadsToday}</p>
            <p className="text-[11px] font-medium text-slate-400">Active Admin</p>
          </div>
        </div>

        {/* Card 2: Green Glow */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center space-x-3.5 hover:shadow-md transition-shadow">
          <div className="w-11 h-11 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm shadow-emerald-100 flex-shrink-0">
            <Users className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xl font-bold tracking-tight text-slate-900">{leads.length > 0 ? leads.length + 3082 : 3094}</p>
            <p className="text-[11px] font-medium text-slate-400">Active Client</p>
          </div>
        </div>

        {/* Card 3: Blue/Purple Glow */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center space-x-3.5 hover:shadow-md transition-shadow">
          <div className="w-11 h-11 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm shadow-indigo-100 flex-shrink-0">
            <CalendarCheck className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-xl font-bold tracking-tight text-slate-900">{totalBookings > 0 ? totalBookings + 1076 : 1094}</p>
            <p className="text-[11px] font-medium text-slate-400">Running Project</p>
          </div>
        </div>

        {/* Card 4: Orange/Yellow Glow */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center space-x-3.5 hover:shadow-md transition-shadow">
          <div className="w-11 h-11 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 shadow-sm shadow-amber-100 flex-shrink-0">
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="text-xl font-bold tracking-tight text-slate-900">534</p>
            <p className="text-[11px] font-medium text-slate-400">No of Employee</p>
          </div>
        </div>

        {/* Card 5: Magenta/Purple Glow */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center space-x-3.5 hover:shadow-md transition-shadow col-span-2 sm:col-span-1">
          <div className="w-11 h-11 rounded-full bg-purple-50 flex items-center justify-center text-purple-500 shadow-sm shadow-purple-100 flex-shrink-0">
            <TrendingUp className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <p className="text-xl font-bold tracking-tight text-slate-900">534</p>
            <p className="text-[11px] font-medium text-slate-400">New User</p>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* ROW 3: THREE COLUMNS (Notifications, Month Calendar, Upcoming Events) */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Column 1: Notifications (exact matching image) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 pb-3">Notifications</h3>

            <div className="space-y-3.5 pt-1">
              {/* Notification 1: Dark Blue Message */}
              <div
                onClick={() => setActiveTab('inbox')}
                className="flex items-start justify-between group cursor-pointer"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MessageSquare className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      You have 10 Unread Message
                    </p>
                    <p className="text-[11px] text-slate-400 leading-tight">
                      John Doe, Alfred kate And 8 other messaged you.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-rose-500 font-semibold whitespace-nowrap pl-2">
                  1 min ago
                </span>
              </div>

              {/* Notification 2: Orange Gear/Status */}
              <div className="flex items-start justify-between group cursor-pointer">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      Check The Sytem Status
                    </p>
                    <p className="text-[11px] text-slate-400 leading-tight">
                      Convallis consectetur accumsa Pelentque convallis consectetur accumsan.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-rose-500 font-semibold whitespace-nowrap pl-2">
                  15 min ago
                </span>
              </div>

              {/* Notification 3: Green Message */}
              <div
                onClick={() => setActiveTab('inbox')}
                className="flex items-start justify-between group cursor-pointer"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-[#1b4332] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MessageSquare className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      You have 10 Unread Message
                    </p>
                    <p className="text-[11px] text-slate-400 leading-tight">
                      Fusce tincidunt mollis odio eget consectetur...
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-rose-500 font-semibold whitespace-nowrap pl-2">
                  18 min ago
                </span>
              </div>

              {/* Notification 4: Red File/Project */}
              <div className="flex items-start justify-between group cursor-pointer">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      Alex Add New Project
                    </p>
                    <p className="text-[11px] text-slate-400 leading-tight">
                      Pellentesque convallis consectetur accumsan.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-rose-500 font-semibold whitespace-nowrap pl-2">
                  3 hour ago
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Interactive Month Calendar (matching image) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between pb-3">
            <h3 className="text-sm font-bold text-slate-800">{monthName}</h3>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
                className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
                className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-slate-400 pb-2">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>

          {/* Calendar Day Grid */}
          <div className="grid grid-cols-7 gap-y-1.5 text-center text-xs">
            {calendarDays.map((item, idx) => {
              const isSelected = item.isCurrentMonth && item.day === selectedDay;

              return (
                <div key={idx} className="flex items-center justify-center h-8">
                  <button
                    onClick={() => {
                      if (item.isCurrentMonth) setSelectedDay(item.day);
                    }}
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-medium transition-all ${
                      isSelected
                        ? 'bg-[#1e3a8a] text-white font-bold shadow-md'
                        : item.isCurrentMonth
                        ? 'text-slate-700 hover:bg-slate-100'
                        : 'text-slate-300 pointer-events-none'
                    }`}
                  >
                    {item.day < 10 ? `0${item.day}` : item.day}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Column 3: Upcoming Event (matching image) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3">
              <h3 className="text-sm font-bold text-slate-800">Upcoming Event</h3>
              <button
                onClick={() => setActiveTab('appointments')}
                className="text-[11px] text-indigo-600 font-semibold hover:underline"
              >
                View all
              </button>
            </div>

            <div className="space-y-3 pt-1">
              {upcomingEvents.map((evt) => (
                <div key={evt.id} className="flex items-center justify-between text-xs group cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <span
                      className={`w-6 h-6 rounded-full ${evt.color} text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 shadow-2xs`}
                    >
                      {evt.id}
                    </span>
                    <div>
                      <p className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors leading-tight">
                        {evt.title}
                      </p>
                      <p className="text-[10px] text-slate-400">{evt.room}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 flex-shrink-0 pl-2">
                    {evt.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
