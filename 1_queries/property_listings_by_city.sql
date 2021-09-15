SELECT properties.id, properties.title, properties.cost_per_night, AVG(property_reviews.rating) as average_rating
FROM properties
WHERE city LIKE '%Vancouver%'
JOIN property_reviews ON property.id = property_id
GROUP BY properties.id
HAVING AVG(property_reviews.rating) >= 4
ORDER BY cost_per_night
LIMIT 10;