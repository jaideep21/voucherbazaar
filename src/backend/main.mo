import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Float "mo:core/Float";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import Outcall "http-outcalls/outcall";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  public type UserProfile = {
    displayName : Text;
  };

  let profiles = Map.empty<Principal, UserProfile>();
  var nextId = 1;
  let vouchers = Map.empty<Nat, Voucher>();
  let categories = Map.empty<Text, [Nat]>();

  type Voucher = {
    id : Nat;
    sellerId : Principal;
    sellerName : Text;
    title : Text;
    category : Text;
    faceValue : Float;
    sellingPrice : Float;
    voucherCode : Text;
    description : Text;
    imageId : Text;
    isSold : Bool;
    createdAt : Int;
  };

  module Voucher {
    public func compare(v1 : Voucher, v2 : Voucher) : Order.Order {
      Nat.compare(v1.id, v2.id);
    };
  };

  public shared ({ caller }) func createVoucher(title : Text, category : Text, faceValue : Float, sellingPrice : Float, voucherCode : Text, description : Text, imageId : Text, sellerName : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create vouchers");
    };

    let id = nextId;
    nextId += 1;

    let voucher : Voucher = {
      id;
      sellerId = caller;
      sellerName;
      title;
      category;
      faceValue;
      sellingPrice;
      voucherCode;
      description;
      imageId;
      isSold = false;
      createdAt = Time.now();
    };

    vouchers.add(id, voucher);

    let categoryEntries = categories.get(category);
    let newCategoryEntries = switch (categoryEntries) {
      case (null) { [id] };
      case (?entries) { entries.concat([id]) };
    };
    categories.add(category, newCategoryEntries);

    id;
  };

  public query ({ caller }) func getAvailableVouchers() : async [Voucher] {
    vouchers.values().toArray().filter(func(v) { not v.isSold });
  };

  public query ({ caller }) func getVouchersByCategory(category : Text) : async [Voucher] {
    let categoryEntries = categories.get(category);
    switch (categoryEntries) {
      case (null) { [] };
      case (?entries) {
        entries.map(
          func(id) {
            switch (vouchers.get(id)) {
              case (null) { Runtime.trap("Voucher does not exist") };
              case (?voucher) { voucher };
            };
          }
        ).filter(func(v) { not v.isSold });
      };
    };
  };

  public query ({ caller }) func getMyVouchers() : async [Voucher] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their vouchers");
    };

    let userVouchers = vouchers.values().toArray().filter(
      func(v) {
        v.sellerId == caller;
      }
    );
    userVouchers.sort();
  };

  public shared ({ caller }) func markAsSold(id : Nat) : async () {
    switch (vouchers.get(id)) {
      case (null) { Runtime.trap("Voucher does not exist") };
      case (?voucher) {
        if (voucher.sellerId != caller) { Runtime.trap("Unauthorized: Only the seller can mark this voucher as sold") };
        let updatedVoucher = { voucher with isSold = true };
        vouchers.add(id, updatedVoucher);
      };
    };
  };

  public shared ({ caller }) func deleteVoucher(id : Nat) : async () {
    switch (vouchers.get(id)) {
      case (null) { Runtime.trap("Voucher does not exist") };
      case (?voucher) {
        if (voucher.sellerId != caller) { Runtime.trap("Unauthorized: Only the seller can delete this voucher") };
        vouchers.remove(id);

        // Remove from category mapping
        let categoryEntries = categories.get(voucher.category);
        switch (categoryEntries) {
          case (null) {};
          case (?entries) {
            let filteredEntries = entries.filter(
              func(entryId) { entryId != id }
            );
            categories.add(voucher.category, filteredEntries);
          };
        };
      };
    };
  };

  public shared ({ caller }) func setDisplayName(name : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set display name");
    };
    let profile : UserProfile = { displayName = name };
    profiles.add(caller, profile);
  };

  public query ({ caller }) func getMyProfile() : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their profile");
    };
    switch (profiles.get(caller)) {
      case (null) { Runtime.trap("No display name found for this user") };
      case (?profile) { profile.displayName };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    profiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    profiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    profiles.add(caller, profile);
  };

  public query ({ caller }) func extractTextTransform(input : Outcall.TransformationInput) : async Outcall.TransformationOutput {
    Outcall.transform(input);
  };

  public shared ({ caller }) func extractTextFromImage(imageUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can extract text from images");
    };
    await Outcall.httpGetRequest(
      "https://api.ocr.space/parse/imageurl?apikey=helloworld&url=" # imageUrl,
      [],
      extractTextTransform
    );
  };
};
