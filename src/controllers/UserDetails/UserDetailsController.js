const {
  getUerDetailServieces,
  updateUserDetailServices,
  addNewUserByAdminService,
  getUserService,
  SearchUserDetailServices,
} = require("../../services/UserDetails/UserDetailServieces");

const getUserDetailController = async (req, res) => {
  const userId = req.query.userId;
  try {
    if (!userId) {
      return res.status(400).send("Check the UserId");
    } else {
      await getUerDetailServieces(req.query, (err, data) => {
        if (err) {
          return res.status(500).send(err);
        } else {
          return res.status(200).send(data);
        }
      });
    }
  } catch (error) {
    res.status(500).send({ error: "Internal server error" });
  }
};
const updateUserDetailController = async (req, res) => {
  try {
    const { name, password, userId } = req.body;

    // Validate required fields
    if (!name || !password || !userId) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    // Call the service to update user details
    const result = await updateUserDetailServices(req.body);
    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error in updateUserDetailController:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ADMIN

const addNewUserByAdminController = async (req, res) => {
  const {
    userName,
    userEmail,
    phoneNumber,
    street,
    city,
    state,
    postalCode,
    country,
    isDefault,
  } = req.body;
  try {
    if (
      !userName ||
      !userEmail ||
      !phoneNumber ||
      !street ||
      !city ||
      !state ||
      !postalCode ||
      !country ||
      !isDefault
    ) {
      res.status(400).send({ message: "Required All Fields" });
    } else {
      await addNewUserByAdminService(req.body, (err, data) => {
        if (err) res.status(400).send(err.error);
        else res.status(201).send(data);
      });
    }
  } catch (error) {
    throw error;
  }
};

const getUserController = async (req, res) => {
  const { limit, offset } = req.query;
  try {
    if (!limit || !offset) {
      res.status(400).send({ message: "Required All Fields" });
    } else {
      await getUserService(req.query, (err, data) => {
        if (err) res.status(400).send(err.error);
        else res.send(data);
      });
    }
  } catch (error) {
    throw error;
  }
};
const SearchUserDetailController = async (req, res) => {
  const userName = req.query.customer;
  try {
    if (!userName) {
      return res.status(400).json({ error: "Check the UserName" });
    }
    const userDetails = await SearchUserDetailServices({ userName });
    return res.status(200).json(userDetails);
  } catch (error) {
    if (error.error) {
      return res.status(404).json(error);
    }
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getUserDetailController,
  updateUserDetailController,
  addNewUserByAdminController,
  getUserController, SearchUserDetailController
};
