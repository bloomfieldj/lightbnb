SELECT properties.city as city, COUNT(reservations.*)
FROM properties
JOIN reservations ON properties.id = property_id
GROUP BY property.city
ORDER BY COUNT(reservations.*) DESC;