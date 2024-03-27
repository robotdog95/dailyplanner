document.addEventListener("DOMContentLoaded", function() {
  async function main() {
  
    const cleanTaskArray = [];
    
    //get hour of now
    function getCurrentHour() {
      const currentDate = new Date();
      const currentHour = currentDate.getHours();
      return currentHour;
  }
  
  // Example usage:
  const currentHour = getCurrentHour();
  console.log(currentHour); // Output: Current hour in integer format
  
    
    const colorArray = ["EFBC9B","FBF3D5","D6DAC8","9CAFAA"];
    function randomColor(max){
      return Math.floor(Math.random() * max);
    }

    //function for cleaning hour
    function cleanHour(title, date){
      const dirtyDate = new Date(date);
      const hour = dirtyDate.getHours();
      cleanTaskArray.push({ [title]: hour });
    };
    
    // Define the task constructor
    function Task(title, taskId, hour) {
      this.title = title;
      this.taskId = taskId;
      this.hour = hour;
    }
    
    //retrieve the tasks for today
    var tasksForToday ="";
    fetch('https://robotdog95.github.io/dailyplanner/tasks.txt')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.text(); // Specify that you're expecting plain text
    })
      
    .then(text => {
      const trimmedText = text.substring(1, text.length - 1);
      tasksForToday = trimmedText;
      // Reconstruct the array
      const keyValuePairs = tasksForToday.split(',');
      const taskArray = [];
      keyValuePairs.forEach(pair => {
          const [task, ...dateParts] = pair.replace(/[{}]/g, '').split(':');
          const date = dateParts.join(':');
          const cleanedTask = task.replace(/"/g, '').trim();
          const cleanedDate = date.replace(/"/g, '').trim();
          taskArray.push({ [cleanedTask]: cleanedDate });
      });
      // Parse date to get CLEAN HOURS
      taskArray.forEach(item => {
          const title = Object.keys(item)[0];
          const date = item[title];
          cleanHour(title, date);
      });
  
      console.log(cleanTaskArray);
  
      // Call ConstructTheTaskObjects() here after cleanTaskArray is populated
      return ConstructTheTaskObjects();
    })
    .then(tasks => {
      var emergencyHour = 8;
      var emergencyHourId = `hour${emergencyHour}`;
      var toggleHour = true;
      for (const task of tasks) {
        
        console.log("in loop ");
        console.log("hour", task.hour);
        let hourId = `hour${task.hour}`;
        console.log("hour id: ", hourId);
        //if (task.hour === null || task.hour === undefined) {
        //  hourId = emergencyHourId;
        //  console.log("hour was null or undefined . New hour: ", emergencyHourId);
        //  emergencyHour++;
        //} else {
        hourId = `hour${task.hour}`;
           // Construct the ID of the hour element
        //console.log("hour was correct. Hour id: ",hourId);
        //}
        const taskId = `task${task.taskId}`;
        const taskElement = document.getElementById(taskId); // Get the task element by ID (assuming title is the ID)
        const hourElement = document.getElementById(hourId); // Get the hour element by ID
        if (taskElement && hourElement) {
          console.log("task div found: ", taskElement, " hourdiv found: ", hourElement);
          console.log("task id: ", taskId, " hour: ", hourId);
          // Position the task relative to the hour element
          console.log("they exist ! doing the if statement");
          setPosition(taskElement, hourElement, toggleHour);
          taskElement.innerHTML = task.title;
        } else {
          console.log("the div with the id ", taskId, "does not exist or the hour", hourId, " is invalid");
          if (!taskElement) {
            // Create a new task element
            const mainDiv = document.querySelector('.main');
            const newDiv = document.createElement('div');
            newDiv.id = taskId; // Set the id attribute
            newDiv.classList.add('task'); // Add a class to the div
            newDiv.innerHTML = task.title;
            newDiv.draggable = true;
            mainDiv.appendChild(newDiv); // Append it to the body element  
            // Place the new div
            if (task.hour === null || task.hour === undefined) {
              console.log("hour was null again, what a silly hour");
              setPosition(newDiv, document.getElementById(emergencyHourId), toggleHour);
              emergencyHour++;
console.log("new emergency hour:", emergencyHour);
            } else {
              setPosition(newDiv, hourElement, toggleHour);
            }
          } else if (!hourElement) {
            //move to emergency hour
            taskElement.innerHTML = task.title;
            console.log("invalid hour: ", hourId, ". Moving the task to ", emergencyHourId);
            if(toggleHour)
            {
              console.log("togglehour: ",toggleHour);
            setPosition(taskElement, document.getElementById(emergencyHourId), toggleHour);
            emergencyHour++;
console.log("new emergency hour:", emergencyHour);
            emergencyHourId = `hour${emergencyHour}`;
            }
            else {
              setPosition(taskElement, document.getElementById(emergencyHourId), toggleHour);
              console.log("else. togglehour: ",toggleHour);
            }
            toggleHour = !toggleHour;
          } else {
            console.log("i don't know what you expect me to do but i'm no magic man boi")
          }
        }
      }
    })
    .catch(error => {
      console.error('There was a problem with the fetch operation:', error);
    });
    

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


    //change the color of the hour
    function HighlightHour(hourElement){
    const currentHour = getCurrentHour();
      hourElement.style.color = `#000000`;
      console.log("highlighted the hour);
    }

    //iterate through all the hours, checking if it's the current one
    const hourArray = [8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23];
    for (let h = 8; h < hourArray.length; h++){
      const nowHourId = `hour${h}`;
      const hourIdToLookFor = `hour${currentHour}`; // Just the ID without HTML markup
const hourElementNow = document.getElementById(nowHourId);

if (hourElementNow && hourElementNow.id === hourIdToLookFor) {
    console.log(hourElementNow.id, " is now !");
    HighlightHour(hourElementNow);
  console.log("highlighted the hour);
}
    }




  
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
  }
  

  
  main();
});
