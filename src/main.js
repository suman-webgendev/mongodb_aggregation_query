"use strict";

import dotenv from "dotenv";
import mongoose from "mongoose";
import { db } from "./models/db.js";

dotenv.config();

// MongoDB connection
mongoose.Promise = Promise;
mongoose.connect(process.env.DATABASE_URL);

mongoose.connection.on("error", (error) => {
  console.log("Database connection error:", error);
});

mongoose.connection.once("connected", () => {
  console.log("Database connected");
});

//!--------------------------------------Filter (Match)--------------------------------------------------

//? Aggregation query for count.
const getNumberOfActiveUsers = async () => {
  try {
    const result = await db.User.aggregate([
      {
        $match: {
          isActive: true,
        },
      },
      {
        $count: "activeUsers",
      },
    ]);
    return result;
  } catch (err) {
    console.error(err);
    return null;
  }
};

console.log("Total Active Users:", await getNumberOfActiveUsers());

//? Aggregation query to count the number of users with a particular tag present in the `tags` array.
const getNumberOfUsersWithEnimTag = async () => {
  try {
    const result = await db.User.aggregate([
      {
        $match: {
          tags: "enim",
        },
      },
      {
        $count: "noOfUsersWithEnimTag",
      },
    ]);

    return result;
  } catch (error) {
    console.error(error);
    return null;
  }
};

console.log(
  "The number of users with 'Enim' tag are:",
  await getNumberOfUsersWithEnimTag()
);

//? Aggregation query to get the particular fields with multiple match conditions.
const getInactiveUsersDataWithValitTag = async () => {
  try {
    const result = await db.User.aggregate([
      {
        $match: {
          isActive: false,
          tags: "velit",
        },
      },
      {
        $project: {
          name: 1,
          age: 1,
        },
      },
    ]);

    return result;
  } catch (error) {
    console.error(error);
    return null;
  }
};

console.log(
  "The inactive users with 'valit' tags are: ",
  await getInactiveUsersDataWithValitTag()
);

//? Aggregation query to get the number of users has 'ad' as second tag.
const getUsersWithSecondTagAd = async () => {
  try {
    const result = await db.User.aggregate([
      {
        $match: {
          "tags.1": "ad",
        },
      },
      {
        $count: "secondTagHasAD",
      },
    ]);
    return result;
  } catch (error) {
    console.error(error);
    return null;
  }
};

console.log(
  "The number of users with 2nd tag 'Ad' are:",
  await getUsersWithSecondTagAd()
);

//? Aggregation query to get the users whom has all the matching tags.
const getAllUsersWithIDandEnim = async () => {
  try {
    const result = await db.User.aggregate([
      {
        $match: {
          tags: {
            $all: ["enim", "id"],
          },
        },
      },
    ]);
    return result;
  } catch (error) {
    console.error(error);
    return null;
  }
};

console.log(
  "The users with 'id' and 'enim' tags are:",
  await getAllUsersWithIDandEnim()
);

//!------------------------------------------------- Grouping-----------------------------------------

//? Aggregation query for averaging the age of users and group them.
const getAvgAgeUsersGroup = async () => {
  try {
    //* This function groups user by gender and then calculate the average age.
    const groupedByGender = await db.User.aggregate([
      {
        $group: {
          _id: "$gender",
          avgAge: {
            $avg: "$age",
          },
        },
      },
    ]);

    //* This function calculates the average age of the all the users in the database.
    const avgForAllUsers = await db.User.aggregate([
      {
        $group: {
          _id: null,
          avgAge: {
            $avg: "$age",
          },
        },
      },
    ]);

    return {
      avgForAllUsers,
      groupedByGender,
    };
  } catch (err) {
    console.error(err);
    return null;
  }
};

console.log(
  "The average age of all the users is:",
  await getAvgAgeUsersGroup()
);

//? Aggregation query to find top 5 common favorite fruits. To calculate it we need to group all the user based on the favorite fruits and counting them then sorting them in asc order then limiting to 5.
const getTop5CommonFavoriteFruits = async () => {
  try {
    const result = await db.User.aggregate([
      {
        $group: {
          _id: "$favoriteFruit",
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
      {
        $limit: 5,
      },
    ]);
    return result;
  } catch (err) {
    console.error(err);
    return null;
  }
};

console.log(
  "Top 5 common favorite fruits are: ",
  await getTop5CommonFavoriteFruits()
);

//? Aggregation query to find the number of male and female users in the database.
const getUserCountByGender = async () => {
  try {
    const result = await db.User.aggregate([
      {
        $group: {
          _id: "$gender",
          totalUsers: {
            $sum: 1,
          },
        },
      },
    ]);
    return result;
  } catch (err) {
    console.error(err);
    return null;
  }
};

console.log(
  "The number of users based on the gender is:",
  await getUserCountByGender()
);

//? Aggregation query to find the number of users that matched the regex in the database.
const findUserWithRegex = async () => {
  try {
    const result = await db.User.aggregate([
      {
        $match: {
          "company.phone": /^\+1 \(940\)/,
        },
      },
      {
        $count: "matchedPhoneNumber",
      },
    ]);

    return result;
  } catch (error) {
    console.error(error);
    return null;
  }
};

console.log(
  "The number of users with matched phone number is: ",
  await findUserWithRegex()
);

//? Aggregation query to find the country with highest number of users.
const getCountryWithHighestUser = async () => {
  try {
    const result = await db.User.aggregate([
      {
        $group: {
          _id: "$company.location.country",
          noOfUsers: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          noOfUsers: -1,
        },
      },
      {
        $limit: 1,
      },
    ]);
    return result;
  } catch (error) {
    console.error(error);
    return null;
  }
};

console.log(
  "The highest number of users in: ",
  await getCountryWithHighestUser()
);

//? Aggregation query to list all the companies with number of employees in USA
const getUsersWorksInCompanyInUSA = async () => {
  try {
    const result = await db.User.aggregate([
      {
        $match: {
          "company.location.country": "USA",
        },
      },
      {
        $group: {
          _id: "$company.title",
          userCount: {
            $sum: 1,
          },
        },
      },
    ]);
    return result;
  } catch (error) {
    console.error(error);
    return null;
  }
};

console.log(
  "All the companies in 'USA' with the number of employees are:",
  await getUsersWorksInCompanyInUSA()
);

//!--------------------------------------------Arrays-----------------------------------

//? Aggregation query to get the average number of tags from the user object.
const avgNumberOfTags = async () => {
  try {
    //* This method uses `unwind` operator to spread the array with the same data but diff array element.
    const result = await db.User.aggregate([
      {
        $unwind: "$tags",
      },
      {
        $group: {
          _id: "$_id",
          numberOfTags: {
            $sum: 1,
          },
        },
      },
      {
        $group: {
          _id: null,
          avgTags: {
            $avg: "$numberOfTags",
          },
        },
      },
    ]);

    //* This method uses `size` operator to calculate the array length and if null it counts as 0. It also uses the `addField` to create a new field.
    const result2 = await db.User.aggregate([
      {
        $addFields: {
          numberOfTags: {
            $size: {
              $ifNull: ["$tags", []],
            },
          },
        },
      },
      {
        $group: {
          _id: null,
          avgTags: {
            $avg: "$numberOfTags",
          },
        },
      },
    ]);

    return {
      result,
      result2,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
};

console.log("The average number of tags is:", await avgNumberOfTags());

//!---------------------------------Sort--------------------------------------------

//? Aggregation query to get last 5 registered users with 'sort' and 'limit' and selected particular fields with 'projection'.
const getLatestRegisteredUsers = async () => {
  try {
    const result = await db.User.aggregate([
      {
        $sort: {
          registered: -1,
        },
      },
      {
        $limit: 5,
      },
      {
        $project: {
          name: 1,
          age: 1,
          registered: 1,
        },
      },
    ]);
    return result;
  } catch (error) {
    console.error(error);
    return null;
  }
};

console.log(
  "The last 5 registered users are:",
  await getLatestRegisteredUsers()
);

//? Aggregation query to get category of the users based on their favorite fruits and return their names in a array with sorting.
const getUserCategoryByFavoriteFruits = async () => {
  try {
    const result = await db.User.aggregate([
      {
        $group: {
          _id: "$favoriteFruit",
          users: {
            $push: "$name",
          },
        },
      },
      {
        $project: {
          _id: 1,
          users: {
            $sortArray: {
              input: "$users",
              sortBy: 1,
            },
          },
        },
      },
    ]);

    return result;
  } catch (error) {
    console.error(error);
    return null;
  }
};

console.log(
  "The categories of the users by favorite fruits are: ",
  await getUserCategoryByFavoriteFruits()
);

//!---------------------------------------------------Lookup------------------------------------

//? Aggregation query to get all the books with author object using 'lookup' and 'arrayElemAt'
const getAllBooksWithAuthorDetails = async () => {
  try {
    const result = await db.Book.aggregate([
      {
        $lookup: {
          from: "authors",
          localField: "author_id",
          foreignField: "_id",
          as: "author_details",
        },
      },
      {
        $addFields: {
          author_details: {
            $arrayElemAt: ["$author_details", 0],
          },
        },
      },
    ]);
    return result;
  } catch (error) {
    console.error(error);
    return null;
  }
};

console.log(
  "All the books with author details",
  await getAllBooksWithAuthorDetails()
);
