'use strict';
module.exports = (sequelize, DataTypes) => {
  const Bookings = sequelize.define('Bookings', {
    name: DataTypes.STRING,
    source: DataTypes.STRING,
    destination: DataTypes.STRING,
    cab_number: DataTypes.STRING
  }, {});
  Bookings.associate = function(models) {
    // associations can be defined here
  };
  return Bookings;
};