function getRandomDateBetween(startISOString, endISOString) {
    const start = new Date(startISOString).getTime();
    const end = new Date(endISOString).getTime();
  
    const randomTimestamp = Math.floor(Math.random() * (end - start)) + start;
    return new Date(randomTimestamp);
  }
  

  const randomDate = getRandomDateBetween(
    // most up to date time stamp from last hive observation
    '2023-04-13T18:30:16.000Z',
    // next following date in test data set
    '2023-04-14T22:59:35.000Z'
  );
  
  console.log(randomDate.toISOString());
  //2023-04-14T21:23:11.238Z