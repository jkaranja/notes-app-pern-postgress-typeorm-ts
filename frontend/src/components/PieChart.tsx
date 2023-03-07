import React, { useState } from "react";
import { Pie } from "react-chartjs-2";

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
      text: "Pie Chart for orders",
    },
  },
};
//can only rep one dataset//extra is ignored
function PieChart({ chartData }: {[key: string]:number}) {
  //charts data
  const [userData, setUserData] = useState({
    labels: UserData.map((data) => data.year),
    datasets: [
      {
        label: "Users Gained",
        data: UserData.map((data) => data.userGain),
        backgroundColor: [
          "#4a148c",
          "#ce93d8",
          "#7b1fa2",
          "#ab47bc",
          "#8e24aa",
        ],
        borderColor: ["#4a148c", "#ce93d8", "#7b1fa2", "#ab47bc", "#8e24aa"],
        borderWidth: 1,
        // cutout: "10%",//sets cutout//default is 0%//if 50% it looks like donut
        // hoverBackgroundColor: "red",
      },
    ],
  });
  //@ts-ignore
  return <Pie data={userData} options={options} />;
}

export default PieChart;
