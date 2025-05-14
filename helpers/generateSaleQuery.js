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
  85, 87, 90, 88, 92, 95, 93, 97, 100, 98, 102, 105, 103, 107, 110, 108, 112,
  115, 113, 117, 120, 118, 122, 125, 123, 127, 130, 128, 132, 135, 133, 138,
  144, 140, 146, 152, 148, 154, 160, 156, 162, 168, 164, 170, 176, 172, 169,
  166, 163, 160, 157, 154, 151, 148, 145, 142, 139, 137, 135, 133, 131, 129,
  127, 126, 125, 124, 123, 125, 127, 130, 134, 139, 145, 152, 160, 169, 179,
  190, 185, 180, 175, 170, 167, 165, 164, 163, 164, 166, 169, 173, 178, 184,
  191, 199, 208, 218, 229, 222, 215, 210, 205, 201, 198, 196, 195, 197, 200,
  204, 209, 215,
];

const sortedRandomDate = generateSortedRandomDates(
  new Date("2012-01-01"),
  new Date(),
  quantity_array.length,
);

function getRandomNumber(min = 10, max = 25) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

for (let i = 0; i < quantity_array.length; i++) {
  console.log(
    `INSERT INTO sale (itemNumber, customerID, customerName, itemName, saleDate, discount, quantity, unitPrice) VALUES ("3", 4, "Bill Gates", "Office Bag", "${sortedRandomDate[i]}", 0, ${quantity_array[i]}, 1300);`,
  );
}

// console.log
