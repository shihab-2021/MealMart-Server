import { FilterQuery, Query } from "mongoose";

class QueryBuilder<T> {
  public modelQuery: Query<T[], T>;
  public query: Record<string, unknown>;

  constructor(modelQuery: Query<T[], T>, query: Record<string, unknown>) {
    this.modelQuery = modelQuery;
    this.query = query;
  }

  // search by fields
  search(searchableFields: string[]) {
    const search = this?.query?.searchTerm as string;
    if (search) {
      const searchCondition = searchableFields.map(
        (field) =>
          ({
            [field]: { $regex: search, $options: "i" },
          }) as FilterQuery<T>,
      );
      this.modelQuery = this.modelQuery.find({
        $or: searchCondition,
      });
    }

    return this;
  }

  filter() {
    const queryObj = { ...this.query }; // copy

    // Filtering
    const excludeFields = [
      "searchTerm",
      "sort",
      "limit",
      "page",
      "fields",
      "minPrice",
      "maxPrice",
    ];

    excludeFields.forEach((el) => delete queryObj[el]);

    this.modelQuery = this.modelQuery.find(queryObj as FilterQuery<T>);

    return this;
  }

  // sort by field
  sort() {
    const sortBy = this?.query?.sortBy as string;
    const sortOrder = this?.query?.sortOrder as string;

    if (sortBy) {
      const order = sortOrder === "asc" ? 1 : -1;
      this.modelQuery = this.modelQuery.sort({ [sortBy]: order });
    } else {
      this.modelQuery = this.modelQuery.sort({ createdAt: -1 });
    }

    return this;
  }

  paginate() {
    const page = Number(this?.query?.page) || 1;
    const limit = Number(this?.query?.limit) || 10;
    const skip = (page - 1) * limit;

    this.modelQuery = this.modelQuery.skip(skip).limit(limit);

    return this;
  }

  priceRange() {
    const minPrice = this?.query?.minPrice;
    const maxPrice = this?.query?.maxPrice;
    const priceFilter: Record<string, unknown> = {};

    if (minPrice !== undefined) {
      priceFilter.$gte = minPrice;
    }

    if (maxPrice !== undefined) {
      priceFilter.$lte = maxPrice;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      this.modelQuery = this.modelQuery.find({
        price: priceFilter,
      } as FilterQuery<T>);
    }

    return this;
  }

  filterByPriceRange() {
    const minPrice = this?.query?.minPrice;
    const maxPrice = this?.query?.maxPrice;
    const priceFilter: Record<string, unknown> = {};

    if (minPrice !== undefined) {
      priceFilter.$gte = minPrice;
    }

    if (maxPrice !== undefined) {
      priceFilter.$lte = maxPrice;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      this.modelQuery = this.modelQuery.find({
        price: priceFilter,
      } as FilterQuery<T>);
    }

    return this;
  }

  filterBySpecifications() {
    const { transmission, fuelType, minMileage, maxMileage } = this.query;

    if (transmission) {
      this.modelQuery = this.modelQuery.find({
        transmission: transmission,
      } as FilterQuery<T>);
    }

    if (fuelType) {
      this.modelQuery = this.modelQuery.find({
        fuelType: fuelType,
      } as FilterQuery<T>);
    }

    if (minMileage || maxMileage) {
      const mileageFilter: Record<string, unknown> = {};
      if (minMileage) mileageFilter.$gte = minMileage;
      if (maxMileage) mileageFilter.$lte = maxMileage;

      this.modelQuery = this.modelQuery.find({
        mileage: mileageFilter,
      } as FilterQuery<T>);
    }

    return this;
  }

  fields() {
    const fields =
      (this?.query?.fields as string)?.split(",")?.join(" ") || "-__v";

    this.modelQuery = this.modelQuery.select(fields);
    return this;
  }

  async countTotal() {
    const totalQueries = this.modelQuery.getFilter();
    const total = await this.modelQuery.model.countDocuments(totalQueries);
    const page = Number(this?.query?.page) || 1;
    const limit = Number(this?.query?.limit) || 10;
    const totalPage = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      totalPage,
    };
  }
}

export default QueryBuilder;
