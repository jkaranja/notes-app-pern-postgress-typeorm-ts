
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
      display: false,
      text: "Line Chart for orders",
    },
  },
};
//area chart is just a line chart with the fill set to true in dataset
function AreaChart({ chartData }: { [key: string]: number }) {
  //charts data
  const [userData, setUserData] = useState({
    labels: UserData.map((data) => data.year),
    datasets: [
      {
        fill: true,
        label: "Users Gained",
        data: UserData.map((data) => data.userGain),
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
        // borderWidth: 2,
        pointBackgroundColor: "rgb(53, 162, 235)",
      },
    ],
  });
  //@ts-expect-error
  return <Line data={userData} options={options} />;
}

export default AreaChart;
