document.addEventListener("DOMContentLoaded", function() {
  //ALL FUNCTIONS GO HERE---------------------------------------------------------------------------------------------------
    
  //define variables necessary for function
  const colorArray = ["EFBC9B","FBF3D5","D6DAC8","9CAFAA"];
  const cleanTaskArray = [];

      //change the color of the hour
      function HighlightHour(hourElement){
        const currentHour = getCurrentHour();
        hourElement.style.color = `#000000`;
        console.log("highlighted the hour");
      };

    function getCurrentHour() {
      const currentDate = new Date();
      const currentHour = currentDate.getHours();
      return currentHour;
  };

  function randomColor(max){
    return Math.floor(Math.random() * max);
  };

  function cleanHour(title, date){
    const dirtyDate = new Date(date);
    const hour = dirtyDate.getHours();
    cleanTaskArray.push({ [title]: hour });
  };

  function Task(title, taskId, hour) {
      this.title = title;
      this.taskId = taskId;
      this.hour = hour;
    };

  function setPosition(task, hour, toggle) {
      const hourPosition = hour.getBoundingClientRect(); // Get position of the hour element
      const color = colorArray[randomColor(colorArray.length)];
      console.log(color);
      // Calculate the top position of the task relative to the hour element
      const topPosition = hourPosition.top + window.scrollY + hourPosition.height;
      // Calculate the left position of the task relative to the hour element
      const leftPosition = hourPosition.left + window.scrollX;
      const rightPosition = hourPosition.right + window.scrollX;
      if (toggle){
        task.style.left = `${leftPosition+80}px`;
      }
      else{
        task.style.right = `${rightPosition+10}px`; 
      }
      // Set the top and left positions for the task element
      task.style.top = `${topPosition+15}px`; //15 should be replaced by a calculation depending on the size of the hour div
      task.style.backgroundColor = `#${color}`;
      
      console.log("setPosition done");
    };



      //retrieve the tasks for today
      async function retrieveTasksFirst() {
        try {
            const response = await fetch('https://robotdog95.github.io/dailyplanner/tasks.txt');
            if (!response.ok) {
                throw new Error('Network response was not ok loool');
            }
            const text = await response.text();
            const trimmedText = text.substring(1, text.length - 1);
            const keyValuePairs = trimmedText.split(',');
            const taskArray = [];
            keyValuePairs.forEach(pair => {
                const [task, ...dateParts] = pair.replace(/[{}]/g, '').split(':');
                const date = dateParts.join(':');
                const cleanedTask = task.replace(/"/g, '').trim();
                const cleanedDate = date.replace(/"/g, '').trim();
                taskArray.push({ [cleanedTask]: cleanedDate });
            });
    
            taskArray.forEach(item => {
                const title = Object.keys(item)[0];
                const date = item[title];
                cleanHour(title, date);
            });
    
            console.log(cleanTaskArray);
    
            const tasks = await ConstructTheTaskObjects();
            var emergencyHour = 8;
            var emergencyHourId = `hour${emergencyHour}`;
            var toggleHour = true;
    
            for (const task of tasks) {
                let hourId = `hour${task.hour}`;
                hourId = `hour${task.hour}`;
                const taskId = `task${task.taskId}`;
                const taskElement = document.getElementById(taskId);
                const hourElement = document.getElementById(hourId);
    
                if (taskElement && hourElement) {
                    setPosition(taskElement, hourElement, toggleHour);
                    taskElement.innerHTML = task.title;
                } else {
                    console.log("the div with the id ", taskId, "does not exist or the hour", hourId, " is invalid");
                    if (!taskElement) {
                        const mainDiv = document.querySelector('.main');
                        const newDiv = document.createElement('div');
                        newDiv.id = taskId;
                        newDiv.classList.add('task');
                        newDiv.innerHTML = task.title;
                        newDiv.draggable = true;
                        mainDiv.appendChild(newDiv);
                        if (task.hour === null || task.hour === undefined) {
                            setPosition(newDiv, document.getElementById(emergencyHourId), toggleHour);
                            emergencyHour++;
                            console.log("new emergency hour:", emergencyHour);
                        } else {
                            setPosition(newDiv, hourElement, toggleHour);
                        }
                    } else if (!hourElement) {
                        taskElement.innerHTML = task.title;
                        console.log("invalid hour: ", hourId, ". Moving the task to ", emergencyHourId);
                        if (toggleHour) {
                            setPosition(taskElement, document.getElementById(emergencyHourId), toggleHour);
                            emergencyHour++;
                            console.log("new emergency hour:", emergencyHour);
                            emergencyHourId = `hour${emergencyHour}`;
                        } else {
                            setPosition(taskElement, document.getElementById(emergencyHourId), toggleHour);
                        }
                        toggleHour = !toggleHour;
                    } else {
                        console.log("i don't know what you expect me to do but i'm no magic man boi")
                    }
                }
            }
    
            const hourArray = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
            for (let h = 8; h < hourArray.length + 8; h++) {
                console.log("looking for hour to highlight...");
                const currentHour = getCurrentHour();
                const nowHourId = `hour${h}`;
                const hourIdToLookFor = `hour${currentHour}`;
                const hourElementNow = document.getElementById(nowHourId);
    
                if (hourElementNow && hourElementNow.id === hourIdToLookFor) {
                    console.log(hourElementNow.id, " is now !!");
                    HighlightHour(hourElementNow);
                    console.log("highlighted the hour");
                }
            };
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
        }
    };
    
  


    async function ConstructTheTaskObjects() {
      const tasks = [];
      // Iterate through cleanTaskArray and create a task for each object
      for (let i = 0; i < cleanTaskArray.length; i++) {
        const taskData = cleanTaskArray[i]; // Get the data for the current task
        const title = Object.keys(taskData)[0]; // Extract the title from the taskData object
        const hour = taskData[title]; // Extract the hour from the taskData object
        // Create a new task object using the constructor
        const newTask = new Task(title, i, hour);
        // Push the new task object to the tasks array
        tasks.push(newTask);
      }
      // Now tasks array contains instances of the Task objects
      console.log(tasks);
      return tasks;
    };
    

async function cookiesWithoutDrag(mTasks){

        //i should make another cookie, for the tasks that haven't been touched during the session. It could be an array for all the positions and then I could compare them with the other array.
      // It's just tat i cannot use drop zones because the tasks haven't been assigned to them yet. But they are assigned to the hours. So this should work.
      //maybeI can use the same cookie, but the value is hour instead of dropzone
      // or maybe it would be safer to make a new array and compare them later.
  console.log("starting to populate cookies with task positions...");
  const cookieArrayNoDrag = {}; // initialize empty array
  const allTasks = document.querySelectorAll('.task');
  allTasks.forEach(task => {
    const thisTaskId = task.id;
    const thisTaskRect = task.getBoundingClientRect(); // Get position of the drop zone
    cookieArrayNoDrag[thisTaskId] = thisTaskId;
  })
  console.log(cookieArrayNoDrag);
  //then push it in cookies

};


async function cookiesAndDrag(mTasks){
  
    const cookieArray = {}; 
  
//set up drop zones first
  let dropZoneHour = 8;
  const dropZones = document.querySelectorAll('.drop-zone');
  var dropBool = true;
  dropZones.forEach(dropZone => {
  dropZone.style.opacity= `0`;
  console.log("in loop for drop zone", dropZone);
  const dropHourId = `hour${dropZoneHour}`;
  const hourElementDrop = document.getElementById(dropHourId);
  setPosition(dropZone, hourElementDrop, dropBool);
  dropZone.addEventListener('dragover', handleDragOver);
  dropZone.addEventListener('drop', handleDrop);
  dropBool = !dropBool;
  if(dropBool){
    dropZoneHour++;
  }
});
  
    // set a cookie
function setCookie(name, value, days) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};
    // get a cookie
    function getCookie(name) {
  const cookieName = `${name}=`;
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i].trim();
    if (cookie.indexOf(cookieName) === 0) {
      return cookie.substring(cookieName.length, cookie.length);
    }
  }
  return null;
};
//MOVE TASKS TO COOKIE POSITIONS ----------------------------------------------------------
function moveToDropPosition(taskId, dropZoneId){
  
    const dropZoneElement = document.getElementById(dropZoneId);
    const droppedTask = document.getElementById(taskId);
    const dropZonePosition = dropZoneElement.getBoundingClientRect(); // Get position of the drop zone
    const topPosition = dropZonePosition.top + window.scrollY;
    const leftPosition = dropZonePosition.left + window.scrollX;
    console.log("task to be moved: ",droppedTask,"target zone: ",dropZoneElement);
    droppedTask.style.top = `${topPosition}px`;
    droppedTask.style.left = `${leftPosition}px`;
    droppedTask.style.width = `320px`;
    console.log("target coordinates: TOP: ",topPosition, "LEFT: ",leftPosition);
    console.log(droppedTask," has been moved to ", dropZoneId);
  
};
// DROP ZONE HANDLING----------------------------------------------------------------------
const dTasks = document.querySelectorAll('.task');



function handleDragStart(event) {
  event.dataTransfer.setData('text/plain', event.target.id);
}

function handleDrag(event) {
  // Update task position or perform other actions as needed
}
    //add draggable feature to all tasks and retrieve their cookie-stored positions
dTasks.forEach(task => {
  task.addEventListener('dragstart', handleDragStart);
  task.addEventListener('drag', handleDrag);
  const thisTaskId = task.id;
  const cookieString = getCookie('taskPositions');  
  const taskPositioning = JSON.parse(cookieString);
  if(taskPositioning && taskPositioning[thisTaskId]){
  const thisTasksDropZoneId = taskPositioning[thisTaskId];
  moveToDropPosition(thisTaskId,thisTasksDropZoneId);
  console.log("Task ", thisTaskId, " is being moved to ", thisTasksDropZoneId);
  }
  else{
    console.log(thisTaskId," has no cookies yet.");
  }
});
function handleDragOver(event) {
event.preventDefault();
}
    
function handleDragLeave(event){
event.preventDefault();
}

function handleDrop(event) {
    event.preventDefault();
    const dropZoneId = event.target.id;
    const taskId = event.dataTransfer.getData('text/plain');
    moveToDropPosition(taskId, dropZoneId);
  //push droppedTask and dropZone Id into cookieArray:
      cookieArray[taskId] = dropZoneId;
      console.log("cookieArray: ", cookieArray);
      setCookie('taskPositions', JSON.stringify(cookieArray), 10); //OBJECTOBJECT OBJECT OBJECT SOLUTION HERE!!!!!!!!!!!!!!!!!!!!!
      const cookieString = getCookie('taskPositions');  
      console.log(cookieString); 
      const taskPositioning = JSON.parse(cookieString);
      console.log(taskPositioning);
  }
  }
   

  async function main() {
    await retrieveTasksFirst();
    const mTasks = await ConstructTheTaskObjects();
    await cookiesWithoutDrag(mTasks);
    await cookiesAndDrag(mTasks); // Pass tasks array to cookiesAndDrag
}

  main();
});
