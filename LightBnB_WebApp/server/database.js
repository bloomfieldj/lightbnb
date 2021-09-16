const { Pool } = require('pg');

const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function (email) {
  const queryString = `
    SELECT * 
    FROM users
    WHERE email = $1  
  `

  return pool
    .query(queryString, [email])
    .then(
      result =>
        result.rows[0] ?
          result.rows[0] :
          null
    )
    .catch((err) => {
      console.log(err.message);
    });
}

exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function (id) {
  const queryString = `
    SELECT *
    FROM users
    WHERE id = $1  
  `

  return pool
    .query(queryString, [id])
    .then(result =>
      result.rows[0] ?
        result.rows[0] :
        null
    )
    .catch((err) => {
      console.log(err.message);
    });
}
exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = function (user) {
  const queryString = `
    INSERT INTO users (name, email, password)
    VALUES ($1, $2, $3)
    RETURNING *;
  `
  return pool
    .query(queryString, [user.name, user.email, user.password])
    .then(result =>
      result.rows[0] ?
        result.rows[0] :
        null
    )
    .catch((err) => {
      console.log(err.message);
    });
}
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function (guest_id, limit = 10) {
  const queryString = `
  SELECT properties.*, reservations.*
  FROM reservations
  JOIN properties on properties.id = property_id
  WHERE guest_id = $1
  LIMIT $2 
  `
  return pool
    .query(queryString, [guest_id, limit])
    .then(result =>
      result.rows ?
        result.rows :
        null
    )
    .catch((err) => {
      console.log(err.message);
    });
}

exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function (options, limit = 10) {
  // 1
  const queryParams = [];
  // 2
  let queryString = `
  SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_id
  `;

  let queryArr = [];

  // 3
  if (options.city) {
    queryParams.push(`%${options.city}%`);
    queryArr.push(`city LIKE $${queryParams.length}`);
  }

  if (options.owner_id) {
    queryParams.push(`${options.owner_id}`);
    queryArr.push(`owner_id = $${queryParams.length} `);
  }

  if (options.minimum_price_per_night) {
    queryParams.push(`${options.minimum_price_per_night}`);
    queryArr.push(`cost_per_night >= $${queryParams.length} `);
  }

  if (options.maximum_price_per_night) {
    queryParams.push(`${options.maximum_price_per_night}`);
    queryArr.push(`cost_per_night <= $${queryParams.length} `);
  }

  if (queryArr[0]) {
    queryString += `WHERE ${queryArr[0]}`
  }

  for (let i = 1; 1 < queryArr.length; i++) {
    if (queryArr[i]) {
      queryString += `AND ${queryArr[i]}`
    }
  }

  if (options.minimum_rating) {
    queryParams.push(`${options.minimum_rating}`);
    queryString += `HAVING avg(rating) >= $${queryParams.length}`;
  }
  // 4

  queryParams.push(limit);
  queryString += `
  GROUP BY properties.id
  ORDER BY cost_per_night
  LIMIT $${queryParams.length};
  `;

  // // 5
  // console.log(queryString, queryParams);

  // // 6
  return pool.query(queryString, queryParams).then((res) => res.rows);
};

exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function (property) {
  let queryString = `
  INSERT INTO properties (owner_id, title, description, thumbnail_photo_url, cover_photo_url, cost_per_night, street, city, province, post_code, country, parking_spaces, number_of_bathrooms, number_of_bedrooms )
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
  RETURNING *;
  `;

  let queryParams = [property.owner_id, property.title, property.description, property.thumbnail_photo_url, property.cover_photo_url, property.cost_per_night, property.street, property.city, property.province, property.post_code, property.country, property.parking_spaces, property.number_of_bathrooms, property.number_of_bedrooms]

  return pool.query(queryString, queryParams).then((res) => res.rows);
}
exports.addProperty = addProperty;
