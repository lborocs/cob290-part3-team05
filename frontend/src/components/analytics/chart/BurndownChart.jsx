import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const BurndownChart = ({ startDate, dueDate, totalTasks, completedTasksByDate = [] }) => {
  // Generate dates between start and due date
  const generateDateLabels = () => {
    const dates = [];
    const start = new Date(startDate);
    const end = new Date(dueDate);
    const today = new Date();
    
    // If project hasn't started yet or dates are invalid
    if (!startDate || !dueDate || start > end) {
      return { labels: [], cutoffIndex: 0 };
    }

    let currentDate = new Date(start);
    let dayIndex = 0;
    
    while (currentDate <= end) {
      dates.push(currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      
      // Keep track of today's index for displaying the vertical line
      if (currentDate.setHours(0,0,0,0) === today.setHours(0,0,0,0)) {
        dayIndex = dates.length - 1;
      }
      
      currentDate = new Date(currentDate);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return { labels: dates, cutoffIndex: dayIndex };
  };

  const { labels, cutoffIndex } = generateDateLabels();
  const today = new Date();
  
  // Calculate ideal burndown line
  const calculateIdealLine = () => {
    return labels.map((_, index) => {
      const remainingPercentage = 1 - (index / (labels.length - 1));
      return totalTasks * remainingPercentage;
    });
  };

  
  const calculateActualLine = () => {
    const actualData = Array(labels.length).fill(null);
    
    s
    let remaining = totalTasks;
    actualData[0] = remaining;
    
    
    completedTasksByDate.forEach(entry => {
      const taskDate = new Date(entry.date);
      
      
      if (taskDate <= today) {
        
        const dateStr = taskDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const dayIndex = labels.indexOf(dateStr);
        
        if (dayIndex !== -1) {
          
          remaining -= entry.count;
          actualData[dayIndex] = remaining;
        }
      }
    });
    
    
    let lastKnownValue = totalTasks;
    for (let i = 0; i < actualData.length; i++) {
      if (actualData[i] !== null) {
        lastKnownValue = actualData[i];
      } else {
        actualData[i] = lastKnownValue;
      }
      
      
      if (i > cutoffIndex) {
        actualData[i] = null;
      }
    }
    
    return actualData;
  };

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Ideal Burndown',
        data: calculateIdealLine(),
        borderColor: '#8A4BA7',
        backgroundColor: 'rgba(138, 75, 167, 0.1)',
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
        tension: 0
      },
      {
        label: 'Actual Burndown',
        data: calculateActualLine(),
        borderColor: '#adda9d',
        backgroundColor: 'rgba(32, 178, 170, 0.1)',
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: '#20B2AA',
        fill: false,
        tension: 0
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 12,
            family: 'Poppins, sans-serif',
          },
          color: '#1C2341',
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${Math.round(context.parsed.y)} tasks remaining`;
          }
        }
      },
      annotation: {
        annotations: {
          todayLine: {
            type: 'line',
            xMin: cutoffIndex,
            xMax: cutoffIndex,
            borderColor: '#FF6B6B',
            borderWidth: 2,
            borderDash: [5, 5],
            label: {
              display: true,
              content: 'Today',
              position: 'top',
              backgroundColor: '#FF6B6B',
              color: 'white',
              font: { 
                size: 10,
                family: 'Poppins, sans-serif' 
              }
            }
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date',
          color: '#1C2341',
          font: {
            size: 12,
            family: 'Poppins, sans-serif',
          },
        },
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: 10,
          },
          callback: function(val, index) {
            // Show fewer x-axis labels when there are many dates
            return index % Math.ceil(labels.length / 10) === 0 ? this.getLabelForValue(val) : '';
          }
        }
      },
      y: {
        title: {
          display: true,
          text: 'Tasks Remaining',
          color: '#1C2341',
          font: {
            size: 12,
            family: 'Poppins, sans-serif',
          },
        },
        beginAtZero: true,
        grid: {
          color: '#D9D9D9',
        },
        ticks: {
          stepSize: Math.max(1, Math.ceil(totalTasks / 5)),
          font: {
            size: 10,
          },
        }
      }
    }
  };

  if (labels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-[#2E3944] mb-2">No timeline data available</p>
        <p className="text-sm text-[#5A5A5A]">Please set project start and due dates</p>
      </div>
    );
  }

  return <Line data={chartData} options={options} />;
};

export default BurndownChart;