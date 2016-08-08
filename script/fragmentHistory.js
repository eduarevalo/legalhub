cursor = db.fragment.find();
while ( cursor.hasNext() ) {
  var fragment = cursor.next();
  delete fragment._id;
  var date = new Date();
  date.setDate(date.getDate() + 1);
  fragment.startDate = date;
  db.fragment.insert(fragment);
}
