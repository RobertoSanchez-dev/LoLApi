export default class Champion {
  constructor(data) {
    this.name = data.name;
    this.title = data.title;
    this.info = data.info;
    this.image = data.image;
    this.lore = data.blurb;
    this.stats = data.stats;
    this.tag = data.tags
  }
}
