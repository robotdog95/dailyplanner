document.addEventListener("DOMContentLoaded", function() {
  //ALL FUNCTIONS GO HERE---------------------------------------------------------------------------------------------------
    

  // define the checkbox
  function createCheckbox(taskElement){
  var checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  taskElement.appendChild(checkbox);
  checkbox.classList.add('checkmark');
  console.log("checkbox added");
  }

  //define variables necessary for function
  const colorArray = ["EFBC9B","FBF3D5","D6DAC8","9CAFAA"];
  const cleanTaskArray = [];
  var tasksAndIds = {};
  var cookieArray = {};
  var dropZoneLaterContent = [];
  async function retrieveCookiesFirst(){
     
  console.log("initializing: RETRIEVECOOKIESFIRST----------------------");
  const beginningCookieString = getCookie('newCookiesWithoutDrag');
  const parsedBeginningCookieString = JSON.parse(beginningCookieString);
  if(parsedBeginningCookieString){
  tasksAndIds = parsedBeginningCookieString;
  console.log("retrieved cookies from previous session: ", tasksAndIds);
  }
  else{
    tasksAndIds = {};
    console.log("no cookies found in previous session. Initialize empty array")
  }

  const droppedCookieString = getCookie('taskPositions');
  const parsedDroppedCookieString = JSON.parse(droppedCookieString);
  if(parsedDroppedCookieString){
  cookieArray = parsedDroppedCookieString;
  console.log("retrieved cookies from previous session: ", cookieArray);
  }
  else{
    cookieArray = {};
    console.log("no dropped cookies found in previous session. Initialize empty array")
  }

  

};
  // check if cookie entry already exists
  function checkCookie(name, entry) {
    console.log("checking for entry", entry, "in cookies:", name);
    const cookieString = getCookie(name);
    console.log("unparsed cookie string:", cookieString);
    const parsedCookieString = JSON.parse(cookieString);
    if (cookieString){
    // Use bracket notation to access the property based on the entry variable
    const thisEntry = parsedCookieString[entry];
    const stringEntry = JSON.stringify(thisEntry);
    console.log("cookie string:", parsedCookieString);
    
    if (thisEntry) {
        console.log(entry, "has been found:", stringEntry);
        return false;
    } else {
        console.log(entry, "is not in cookies:", stringEntry);
        return true;
    }
  }
  else{
    console.log("the cookie doesn't exist");
    return true;
  }
}

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


  //remove empty tasks
  function removeEmptyTasks(taskElement){
    taskElement.remove();
    console.log("task has been removed.");
      
  };
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
    if(hour){
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
      
      console.log("setPosition done");}
    else{
      console.log("hour was null. Could not set position");
    }
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
            console.log("tasks processed by ConstructTheTaskObjects: ",tasks);
            var emergencyHour = 8;
            var emergencyHourId = `hour${emergencyHour}`;
            var toggleHour = true;
    
            for (const task of tasks) {
                console.log("in loop for task ", task);
                let hourId = `hour${task.hour}`;
                hourId = `hour${task.hour}`;
                const taskId = `task${task.taskId}`;
                const taskElement = document.getElementById(taskId);
                const hourElement = document.getElementById(hourId);
                if (taskElement && hourElement) {
                    setPosition(taskElement, hourElement, toggleHour);
                    
                    taskElement.textContent = task.title;
                    createCheckbox(taskElement);
                    


                    if (checkCookie('newCookiesWithoutDrag', taskId)){
                    console.log("pushing the position into tasksAndIds")
                    tasksAndIds[taskId] = hourId;
                    }
                    else {
                      console.log("tasksAndIds HAVE NOT been updated for ", taskId);
                    }
                }
                else {
                    console.log("the div with the id ", taskId, "does not exist or the hour", hourId, " is invalid");
                    if (!taskElement) {
                        const mainDiv = document.querySelector('.main');
                        const newDiv = document.createElement('div');
                        newDiv.id = taskId;
                        newDiv.classList.add('task');
                        
                        newDiv.textContent = task.title;
                        createCheckbox(newDiv);
                        newDiv.draggable = true;
                        mainDiv.appendChild(newDiv);
                        
                        if (task.hour === null || task.hour === undefined) {
                            setPosition(newDiv, document.getElementById(emergencyHourId), toggleHour);
                            emergencyHour++;
                            console.log("new emergency hour:", emergencyHour);
                            if (checkCookie('newCookiesWithoutDrag', taskId)){
                              console.log("pushing the position into tasksAndIds")
                              tasksAndIds[taskId] = emergencyHourId;
                              }
                              else {
                                console.log("tasksAndIds HAVE NOT been updated for ", taskId);
                              }
                        } else {
                            setPosition(newDiv, hourElement, toggleHour);
                            if (checkCookie('newCookiesWithoutDrag', taskId)){
                              console.log("pushing the position into tasksAndIds")
                              tasksAndIds[taskId] = hourId;
                              }
                              else {
                                console.log("tasksAndIds HAVE NOT been updated for ", taskId);
                              }
                        }
                    } else if (!hourElement) {
                      
                        taskElement.textContent = task.title;
                        createCheckbox(taskElement);
                        console.log("invalid hour: ", hourId, ". Moving the task to ", emergencyHourId);
                        if (toggleHour) {
                          if (checkCookie('newCookiesWithoutDrag', taskId)){
                            console.log("pushing the position into tasksAndIds")
                            tasksAndIds[taskId] = emergencyHourId;
                            }
                            else {
                              console.log("tasksAndIds HAVE NOT been updated for ", taskId);
                            }
                            setPosition(taskElement, document.getElementById(emergencyHourId), toggleHour);
                            emergencyHour++;
                            console.log("new emergency hour:", emergencyHour);
                            emergencyHourId = `hour${emergencyHour}`;
                            
                        } else {
                            setPosition(taskElement, document.getElementById(emergencyHourId), toggleHour);
                            if (checkCookie('newCookiesWithoutDrag', taskId)){
                              console.log("pushing the position into tasksAndIds")
                              tasksAndIds[taskId] = emergencyHourId;
                              }
                              else {
                                console.log("tasksAndIds HAVE NOT been updated for ", taskId);
                              }
                        }
                        toggleHour = !toggleHour;
                    } else {
                        console.log("i don't know what you expect me to do but i'm no magic man boi")
                    }
                }
                console.log("tasks and id look like this: ",tasksAndIds);
                
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
            return tasksAndIds;
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

  console.log("starting to populate cookies with task positions...");
  console.log(tasksAndIds);
  setCookie('newCookiesWithoutDrag', JSON.stringify(tasksAndIds), 10); //i just dumped the whole array into the cookie. Let's see if it works
  const newCookieString = getCookie('newCookiesWithoutDrag');
  console.log("new cookie: ", newCookieString);

}


async function cookiesAndDrag(mTasks){
  
 
  
//set up drop zones first
  let dropZoneHour = 8;
  const dropZones = document.querySelectorAll('.drop-zone');
  var dropBool = true;
  dropZones.forEach(dropZone => {
    if (dropZone.id != "later" && dropZone.id != "trash"){
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
    }
    else{
      console.log("handling custom dropzone: ", dropZone);
    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('drop', handleDrop);
    if(dropZone.id == "trash"){
      dropZone.addEventListener("dragenter", handleDragEnter);
      dropZone.addEventListener("dragleave", handleDragLeave);
    }
    
    }
});
  

//MOVE TASKS TO COOKIE POSITIONS ----------------------------------------------------------
function moveToDropPosition(taskId, dropZoneId){
  
    const dropZoneElement = document.getElementById(dropZoneId);
    const droppedTask = document.getElementById(taskId);
    const taskContent = droppedTask.textContent;
    if (taskContent){
    const dropZonePosition = dropZoneElement.getBoundingClientRect(); // Get position of the drop zone
    const topPosition = dropZonePosition.top + window.scrollY;
    const leftPosition = dropZonePosition.left + window.scrollX;
    console.log("task to be moved: ",droppedTask,"target zone: ",dropZoneElement);
    if(dropZoneId == "later"){
      var numberOfTasksInThisZone = dropZoneLaterContent.length;
      var offset = `${numberOfTasksInThisZone*65}`;
      console.log("offset for this task: ",offset);
      var offsetTopPosition = topPosition + parseInt(offset);
      console.log("top position for this task: ",offsetTopPosition);
      droppedTask.style.top = `${offsetTopPosition}px`;
      droppedTask.style.left = `${leftPosition}px`;
      droppedTask.style.width = `320px`;
      console.log("target coordinates: TOP: ",offsetTopPosition, "LEFT: ",leftPosition);
      console.log(droppedTask," has been moved to ", dropZoneId);
    }
    else if(dropZoneId == "trash"){
        removeEmptyTasks(droppedTask);
        console.log("removed task: ", taskId);

      //handle trash here -------------------------------------------------------------------------
    }
    else{
    droppedTask.style.top = `${topPosition}px`;
    droppedTask.style.left = `${leftPosition}px`;
    droppedTask.style.width = `320px`;
    console.log("target coordinates: TOP: ",topPosition, "LEFT: ",leftPosition);
    console.log(droppedTask," has been moved to ", dropZoneId);
    }
    }
    else{
      console.log("attempted to move an empty task : ", taskId, ". The task has not been moved");
      removeEmptyTasks(droppedTask);
    }
};


// DROP ZONE HANDLING----------------------------------------------------------------------
const dTasks = document.querySelectorAll('.task');



function handleDragStart(event) {
  event.dataTransfer.setData('text/plain', event.target.id);
}

function handleDragOver(event) {
  event.preventDefault();
}

function handleDrag(event) {

  // Update task position or perform other actions as needed
}
    //add draggable feature to all tasks and retrieve their cookie-stored positions
dTasks.forEach(task => {
  var dTaskContent = task.textContent;
  if (dTaskContent){
  task.addEventListener('dragstart', handleDragStart);
  task.addEventListener('drag', handleDrag);
  }
  else{
    removeEmptyTasks(task);
  }
  const thisTaskId = task.id;
  console.log("adding draggable feature and checking for initial position for ", thisTaskId);
  const cookieString = getCookie('taskPositions');  
  const taskPositioning = JSON.parse(cookieString);
  if(taskPositioning && taskPositioning[thisTaskId]){
  const thisTasksDropZoneId = taskPositioning[thisTaskId];
  moveToDropPosition(thisTaskId,thisTasksDropZoneId);
  console.log("Task ", thisTaskId, " had been dragged in previous session and is being moved to ", thisTasksDropZoneId);
  cookieArray[thisTaskId] = thisTasksDropZoneId;
  setCookie('taskPositions', JSON.stringify(cookieArray), 10); 
  }
  else{
    console.log(thisTaskId," has not been dragged in previous session.");

    //yes, this won't work if there are no cookies yet but it will be just for the first run. Then it will be fine.
    const allTasksCookieString = getCookie('newCookiesWithoutDrag');
    const parsedAllTasksCookieString = JSON.parse(allTasksCookieString);
    console.log("retrieved cookies for undragged tasks: ", parsedAllTasksCookieString);
    
    if(parsedAllTasksCookieString){
      var checkedCookie = checkCookie('newCookiesWithoutDrag', thisTaskId);
      console.log(checkedCookie);
      const undraggedTaskHourId = parsedAllTasksCookieString[thisTaskId];
      console.log("this task's hour ID from previous session: ",undraggedTaskHourId)
      if(undraggedTaskHourId){ //check if tasks has an hour id. If not, it means the task doesn't exist
        const taskElement = document.getElementById(thisTaskId);
        const hourElement = document.getElementById(undraggedTaskHourId);
        console.log("initiating setPosition for ",taskElement, " with target: ",hourElement);
        setPosition(taskElement, hourElement, true);
        //prepare values for new cookie entry

        tasksAndIds[thisTaskId] = undraggedTaskHourId;
        setCookie('newCookiesWithoutDrag', JSON.stringify(tasksAndIds), 10);
        const updatedCookieString = getCookie('newCookiesWithoutDrag');
        const parsedUpdatedCookieString = JSON.parse(updatedCookieString);
        console.log("updated cookies: ", parsedUpdatedCookieString);
      }
      else{
        console.log("task ",thisTaskId," probably doesn't exist.")
      }
    }
    else{
      console.log("no cookies at all bro");
    }
  }
});
function handleDragEnter(event) {
  event.preventDefault();
  const dropZoneId = event.target.id;
  if(dropZoneId == "trash"){
    console.log("entering trash");
    const trashcan = document.getElementById(dropZoneId);
    trashcan.style.backgroundImage = "url('trash_open.png')";
  }
}
    
function handleDragLeave(event){
  event.preventDefault();
  const dropZoneId = event.target.id;
  if(dropZoneId == "trash"){
    console.log("leaving trash");
    const trashcan = document.getElementById(dropZoneId);
    trashcan.style.backgroundImage = "url('trash_closed.png')";

  }
}

function handleDrop(event) {
    event.preventDefault();
    const dropZoneId = event.target.id;
    const taskId = event.dataTransfer.getData('text/plain');
    if(dropZoneId == "later"){
      if(dropZoneLaterContent.indexOf(taskId) == -1){ //check if task is already in array
      dropZoneLaterContent.push(taskId);
      console.log("dropzonelater array: ",dropZoneLaterContent);
      }
    }
    if (dropZoneLaterContent.includes(taskId)&&dropZoneId != "later"){
      var index = dropZoneLaterContent.indexOf(taskId);
      if (index > -1) { // only splice array when item is found
        dropZoneLaterContent.splice(index, 1); // 2nd parameter means remove one item only
        console.log("removed ", taskId, "from later drop zone. New list of taks in this drop zone: ",dropZoneLaterContent);
      }
    }
    
    moveToDropPosition(taskId, dropZoneId);
    if(dropZoneId == "trash"){
      console.log("element put in trash");
      const trashcan = document.getElementById(dropZoneId);
      trashcan.style.backgroundImage = "url('trash_closed.png')";
    }
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
    await retrieveCookiesFirst();
    await retrieveTasksFirst();
    const mTasks = await ConstructTheTaskObjects();
    await cookiesAndDrag(mTasks); // Pass tasks array to cookiesAndDrag
    await cookiesWithoutDrag(mTasks);
}

  main();
});
