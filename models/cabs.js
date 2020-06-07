'use strict';
module.exports = (sequelize, DataTypes) => {
  const Cabs = sequelize.define('Cabs', {
    driver_name: DataTypes.STRING,
    cab_number: DataTypes.STRING,
    location: DataTypes.STRING,
    check_available: DataTypes.BOOLEAN,
    contact: DataTypes.STRING
  }, {});
  Cabs.associate = function(models) {
    // associations can be defined here
  };
  return Cabs;
};