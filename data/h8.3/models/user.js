const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true,
    minlength: 1,
    set: password => {
      if (!password || password.length === 0) return password;
      return bcrypt.hashSync(password, 10);
    }
  }
});

userSchema.methods.checkPassword = async function (password) {
  let compare = await bcrypt.compare(password, this.password);
  console.log("checking password ", compare)
  return compare
};

module.exports = mongoose.model("User", userSchema);