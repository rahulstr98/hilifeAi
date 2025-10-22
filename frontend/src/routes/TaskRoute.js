import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Loading from "../Loading";


const Taskcategory = React.lazy(() => import("../pages/task/Taskcategory"));
const TaskSubcategory = React.lazy(() => import("../pages/task/Tasksubcategory"));
const Trainingcategory = React.lazy(() => import("../pages/task/training/Trainingcategory"));
const Trainingsubcategory = React.lazy(() => import("../pages/task/training/Trainingsubcategory"));
const TrainingDetails = React.lazy(() => import("../pages/task/training/Trainingdetails"));
const TrainingUserPanel = React.lazy(() => import("../pages/task/training/Traininguserpanel"));


const App = () => {
    return (
        <>
            <Suspense fallback={<Loading />}>
                {/* <Watermark /> */}
                <Routes>
                    <Route path="task/master/taskcategory" element={<Taskcategory />} />
                    <Route path="task/master/tasksubcategory" element={<TaskSubcategory />} />
                    <Route path="task/training/master/trainingcategory" element={<Trainingcategory />} />
                    <Route path="task/training/master/trainingsubcategory" element={<Trainingsubcategory />} />
                    <Route path="task/training/master/trainingdetails" element={<TrainingDetails />} />
                    <Route path="task/training/master/traininguserpanel" element={<TrainingUserPanel />} />
                </Routes>
                {/* <Footer /> */}
            </Suspense>
            <br />
        </>
    );
};

export default App;