import React, { useState } from "react";
import { Line } from "react-chartjs-2";
import UserData from "../Data";

const options = {
  responsive: true,
  plugins: {
    legend: {
      // display: false,
      position: "bottom", //default is top
    },
    title: {
      display: true,
      text: "Line Chart for orders",
    },
  },
};

function LineChart({ chartData }: { [key: string]: number }) {
  //charts data
  const [userData, setUserData] = useState({
    labels: UserData.map((data) => data.year),
    datasets: [
      {
        label: "Users Gained",
        data: UserData.map((data) => data.userGain),
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        borderWidth: 2,
        pointBackgroundColor: "red",
      },
      {
        label: "Users Lost",
        data: UserData.map((data) => data.userLost),
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
        borderWidth: 2,
        pointBackgroundColor: "rgb(53, 162, 235)",
      },
    ],
  });
  //@ts-ignore
  return <Line data={userData} options={options} />;
}

export default LineChart;
