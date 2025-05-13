function getRandomDate(start, end) {
  const date = new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  );
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function generateSortedRandomDates(start, end, count) {
  const dates = [];

  for (let i = 0; i < count; i++) {
    const date = new Date(
      start.getTime() + Math.random() * (end.getTime() - start.getTime()),
    );
    dates.push(date);
  }

  dates.sort((a, b) => a - b); // Sort ascending

  return dates.map((date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });
}

const quantity_array = [
  105, 110, 108, 115, 120, 118, 125, 132, 128, 135, 142, 138, 145, 152, 148,
  155, 164, 158, 167, 175, 172, 180, 188, 182, 190, 200, 195, 205, 215, 210,
  220, 232, 225, 235, 245, 240, 252, 265, 258, 270,
];

const sortedRandomDate = generateSortedRandomDates(
  new Date("2018-01-01"),
  new Date(),
  quantity_array.length,
);
// console.log(sortedRandomDate);
// console.log(quantity_array.length);

function getRandomNumber(min = 10, max = 25) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

for (let i = 0; i < quantity_array.length; i++) {
  console.log(
    `INSERT INTO sale (itemNumber, customerID, customerName, itemName, saleDate, discount, quantity, unitPrice) VALUES ("1002", 4, "Bill Gates", "Versace Eros", "${sortedRandomDate[i]}", 2, ${quantity_array[i]}, 5000);`,
  );
}

// console.log
