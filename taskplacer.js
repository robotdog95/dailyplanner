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
      async function retrieveTasksFirst(){
        console.log("retrieve tasks is being run");
        
      };
  

// MAIN STARTS HERE ----------------------------------------------------------------------------------------------------------

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
    

  

//MAIN ENDS HERE---------------------------------------------------------------------------------------------------
async function cookiesAndDrag(mTasks){

    

// COOKIES --------------------------------------------------------------------------------
   // prepare variables for cookies
    // it should be: taskId, dropZoneId, (days)
    // so it should be an array of key = taskId, value = dropZoneId
    
    //initialize array for cookies:
    const cookieArray = {};
  
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
    droppedTask.style.top = `${topPosition}px`;
    droppedTask.style.left = `${leftPosition}px`;
    droppedTask.style.width = `320px`;
    console.log("task has been moved to ", dropZoneId);
  
};
// DROP ZONE HANDLING----------------------------------------------------------------------
const dTasks = document.querySelectorAll('.task');

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

function handleDragStart(event) {
  event.dataTransfer.setData('text/plain', event.target.id);
}

function handleDrag(event) {
  // Update task position or perform other actions as needed
}
    
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
    await cookiesAndDrag(mTasks); // Pass tasks array to cookiesAndDrag
}

  main();
});
