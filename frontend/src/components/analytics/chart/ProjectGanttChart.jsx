import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, annotationPlugin);

const ProjectGanttChart = ({ projects }) => {
  // Find the earliest start date among all projects
  const earliestStartDate = Math.min(
    ...projects.map((project) => new Date(project.startDate).getTime())
  );

  // Define a set of colors for the projects
  const colors = ['#8e8e91', '#eab385', '#adda9d', '#f5a3a3'];
  const borderColors = ['#1E6B37', '#D48F07', '#136A8C', '#B02A37'];

  // Calculate today's position in days from the earliest start date
  const today = new Date().getTime();
  const todayPosition = (today - earliestStartDate) / (1000 * 60 * 60 * 24);

  // Convert project data into chart-friendly format
  const projectData = projects.map((project) => ({
    name: project.name,
    start: (new Date(project.startDate).getTime() - earliestStartDate) / (1000 * 60 * 60 * 24), // Days from the earliest start date
    duration: (new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) / (1000 * 60 * 60 * 24), // Duration in days
  }));

  // Chart data
  const data = {
    labels: projectData.map((project) => project.name),
    datasets: [
      {
        label: 'Offset',
        data: projectData.map((project) => project.start),
        backgroundColor: 'transparent', // Invisible bar for offset
      },
      {
        label: 'Project Duration',
        data: projectData.map((project) => project.duration),
        backgroundColor: projectData.map((_, index) => colors[index % colors.length]), // Cycle through colors
        borderColor: projectData.map((_, index) => borderColors[index % borderColors.length]), // Cycle through border colors
        borderWidth: 2, 
        barThickness: 40,
        borderRadius: 15, 
      },
    ],
  };

  // Chart options
  const options = {
    indexAxis: 'y', // Horizontal bars
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const project = projects[context.dataIndex];
            return `Start: ${project.startDate}, End: ${project.endDate}`;
          },
        },
      },
      annotation: {
        annotations: {
          todayLine: {
            type: 'line',
            xMin: todayPosition,
            xMax: todayPosition,
            borderColor: 'red',
            borderWidth: 2,
            borderDash: [6, 3], // Creates a dashed/striped line - [dash length, gap length]
            label: {
              display: true,
              content: 'Today',
              position: 'start',
              backgroundColor: 'rgba(255, 0, 0, 0.8)',
              color: 'white',
              font: {
                size: 12,
                weight: 'bold',
              },
            },
          },
        },
      },
    },
    // ...existing code...
    scales: {
      x: {
        stacked: true, // Enable stacking for proper offset visualization
        ticks: {
          callback: (value) => {
            const date = new Date(earliestStartDate + value * (1000 * 60 * 60 * 24));
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          },
        },
      },
      y: {
        stacked: true, 
        ticks: {
          font: {
            size: 12,
          },
        },
      },
    },
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-lg font-semibold text-[#1C2341] mb-4">Project Gantt Chart</h2>
      <Bar data={data} options={options} />
    </div>
  );
};

export default ProjectGanttChart;