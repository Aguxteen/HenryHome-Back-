const { Housing, Location, Facilities, Services, UserMod } = require("../db");

const getHouses = async (req, res, next) => {
  try {
    const Houses = await Housing.findAll({
      include: [
        { model: Location },
        { model: Facilities },
        { model: Services },
        { model: UserMod, attributes: ["id", "email"] },
      ],
    });
    res.json(Houses);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const getHouseById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const Houses = await Housing.findByPk(id, {
      include: [
        { model: Location },
        { model: Facilities },
        { model: Services },
        { model: UserMod },
      ],
    });
    res.json(Houses);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const createHouse = async (req, res, next) => {
  const {
    name,
    pricePerNight,
    numberOfPeople,
    description,
    houseRules,
    images,
    services,
    facilities,
    location,
    User_id,
  } = req.body;
  try {
    const [house, status] = await Housing.findOrCreate({
      where: {
        name: name.toLowerCase(),
      },
      defaults: {
        pricePerNight,
        numberOfPeople,
        description,
        houseRules,
        images,
      },
    });

    let servicesDB = await Services.findAll({
      where: { name: services },
    });
    let facilitiesDB = await Facilities.findAll({
      where: { name: facilities },
    });
   
    await house.addServices(servicesDB);
    await house.addFacilities(facilitiesDB);
    await house.setLocation(location);
    await house.setUserMod(req.userId);

    res.status(201).json(house);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const updateHouse = async (req, res, next) => {
  const {
    name,
    pricePerNight,
    numberOfPeople,
    description,
    houseRules,
    images,
    id,
    status,
  } = req.body;
  try {
    if (status) {
      await Housing.update(
        { status: status },
        {
          where: {
            id: id,
          },
        }
      );
    }
    await Housing.update(
      {
        name,
        pricePerNight,
        numberOfPeople,
        description,
        houseRules,
        images,
      },
      {
        where: {
          id: id,
        },
      }
    );
    const resp = await Housing.findAll({ where: { id: id } });

    res.status(200).send(resp);
  } catch (error) {
   console.log(error);
   next(error);
  }
};

const deleteHouse = async (req, res, next) => {
  const { id } = req.body;
  try {
    const house = await Housing.destroy({
      where: {
        id,
      },
    });
    res.json({ msg: "Successfully deleted" });
  } catch (error) {
   console.log(error);
   next(error);
  }
};

module.exports = {
  getHouses,
  getHouseById,
  createHouse,
  updateHouse,
  deleteHouse,
};
