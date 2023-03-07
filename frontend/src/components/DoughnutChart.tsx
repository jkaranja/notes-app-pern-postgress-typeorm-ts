import { Button } from "@mui/material";
import React, { useState } from "react";
import { Doughnut } from "react-chartjs-2";
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
      text: "Doughnut Chart for orders",
    },
  },
};

//optional// adds text inside donut
//text can be a variable eg total
const textCenter = {
  id: "textCenter",
  beforeDatasetsDraw(chart: any, args: any, pluginOptions: any) {
    const { ctx, data } = chart;
    //ctx is canvas//used to draw graphics//see w3schoool
    ctx.save();
    ctx.font = "normal 17px roboto";
    ctx.fillStyle = "#000";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      "2000k total",
      chart.getDatasetMeta(0).data[0].x,
      chart.getDatasetMeta(0).data[0].y
    );
  },
};

//can only rep one dataset//extra is ignored
function DoughnutChart({ chartData }: { [key: string]: number }) {
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
        cutout: "70%", //default is 50%//empty space inside//right size
        // radius: "40%"//sets size of the donut, //default is 100%
      },
    ],
  });
  //@ts-ignore
  return <Doughnut data={userData} options={options} plugins={[textCenter]} />;
}

export default DoughnutChart;
