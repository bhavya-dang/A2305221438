const express = require("express");
const app = express();
const axios = require("axios");
require("dotenv").config();

const port = 3000;
const token = process.env.BEARER_TOKEN;

// Window size for storing numbers
const windowSize = 10;

// Store the numbers received from the third-party server
let windowCurrState = new Set();

// Function to fetch numbers from the third-party server
async function fetchNumbers(numberid) {
  try {
    const response = await axios.get(`http://20.244.56.144/test/${numberid}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching numbers:", error);
    return { numbers: [] };
  }
}

// Function to calculate the average of the numbers in the window
function calculateAverage(numbers) {
  if (numbers.length === 0) {
    return 0;
  }
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  return sum / numbers.length;
}

// Endpoint to handle number requests
app.get("/numbers/:numberId", async (req, res) => {
  const numberId = req.params.numberId;
  let type;
  // Fetch numbers from the third-party server
  if (numberId === "e") {
    type = "even";
  } else if (numberId === "p") {
    type = "primes";
  } else if (numberId === "f") {
    type = "fibo";
  } else if (numberId === "r") {
    type = "rand";
  }
  const numbers = await fetchNumbers(type);

  // Update the window state
  const windowPrevState = Array.from(windowCurrState);
  numbers.numbers.forEach((number) => windowCurrState.add(number));

  // Ensure the numbers are unique and limit to the window size
  if (windowCurrState.size > windowSize) {
    windowCurrState = new Set(Array.from(windowCurrState).slice(-windowSize));
  }

  // Calculate the average of the numbers in the window
  const currentNumbersArray = Array.from(windowCurrState);
  const average = calculateAverage(currentNumbersArray);

  // Format the response
  const response = {
    windowPrevState,
    windowCurrState: currentNumbersArray,
    numbers: numbers.numbers,
    avg: average,
  };

  res.json(response);
});

app.listen(port, () => {
  console.log(`Average Calculator microservice listening on port ${port}`);
});
